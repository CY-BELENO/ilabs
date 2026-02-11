# sensor_manager.py
import threading
import serial
import RPi.GPIO as GPIO
import time
import paho.mqtt.client as mqtt
import json
from datetime import datetime, timedelta

class SensorManager:
    def __init__(self, app, db):
        self.app = app
        self.db = db
        self.running = False
        self.nfc_active = False
        self.pir_active = False
        self.esp32_active = False
        
        # Thread locks for thread safety
        self.nfc_lock = threading.Lock()
        self.pir_lock = threading.Lock()
        
        # PIR motion tracking
        self.last_motion_time = {}
        self.pir_timeout = app.config['PIR_TIMEOUT_MINUTES'] * 60
        
        # Initialize GPIO for PIR
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(app.config['PIR_GPIO_PIN'], GPIO.IN)
        
        # MQTT client for ESP32
        self.mqtt_client = mqtt.Client()
        self.mqtt_client.on_connect = self._on_mqtt_connect
        self.mqtt_client.on_message = self._on_mqtt_message
        
    def start_monitoring(self):
        """Start all sensor monitoring threads"""
        self.running = True
        
        # Start NFC monitoring thread
        nfc_thread = threading.Thread(target=self._monitor_nfc, daemon=True)
        nfc_thread.start()
        self.nfc_active = True
        
        # Start PIR monitoring thread
        pir_thread = threading.Thread(target=self._monitor_pir, daemon=True)
        pir_thread.start()
        self.pir_active = True
        
        # Connect to MQTT broker for ESP32
        try:
            self.mqtt_client.connect(
                self.app.config['MQTT_BROKER'],
                self.app.config['MQTT_PORT'],
                60
            )
            self.mqtt_client.loop_start()
            self.esp32_active = True
            print(f"Connected to MQTT broker at {self.app.config['MQTT_BROKER']}")
        except Exception as e:
            print(f"Failed to connect to MQTT: {e}")
        
        print("All sensor monitoring started")
    
    def _monitor_nfc(self):
        """Monitor NFC reader for tag scans"""
        try:
            nfc_serial = serial.Serial(
                port=self.app.config['NFC_SERIAL_PORT'],
                baudrate=self.app.config['NFC_BAUD_RATE'],
                timeout=1
            )
            
            print(f"NFC monitoring started on {self.app.config['NFC_SERIAL_PORT']}")
            
            while self.running:
                try:
                    # Read data from NFC reader (adjust based on your reader's protocol)
                    if nfc_serial.in_waiting > 0:
                        data = nfc_serial.readline().decode('utf-8', errors='ignore').strip()
                        
                        if data and len(data) > 0:
                            with self.nfc_lock:
                                self._process_nfc_tag(data)
                
                except Exception as e:
                    print(f"NFC read error: {e}")
                
                time.sleep(0.1)  # Small delay to prevent CPU overload
            
            nfc_serial.close()
            
        except Exception as e:
            print(f"Failed to initialize NFC reader: {e}")
            self.nfc_active = False
    
    def _process_nfc_tag(self, tag_data):
        """Process NFC tag data and update occupancy"""
        # Parse tag ID (format depends on your reader)
        # Example: "Tag UID: 04:A3:B2:C1:D5:E6:70" or just "04A3B2C1D5E670"
        tag_id = tag_data
        
        # Clean up tag ID
        if "UID:" in tag_data:
            tag_id = tag_data.split("UID:")[1].strip()
        tag_id = tag_id.replace(" ", "").replace(":", "")
        
        print(f"[NFC] Tag detected: {tag_id}")
        
        # Find faculty by NFC tag
        with self.app.app_context():
            from models import Faculty, OccupancyStatus, Booking
            
            faculty = Faculty.query.filter_by(nfc_tag_id=tag_id).first()
            
            if not faculty:
                print(f"[NFC] No faculty found with tag: {tag_id}")
                return
            
            print(f"[NFC] Faculty identified: {faculty.full_name}")
            
            # Check for current booking or schedule
            current_time = datetime.now()
            
            # Find active booking for this faculty
            booking = Booking.query.filter(
                Booking.faculty_id == faculty.id,
                Booking.booking_date == current_time.date(),
                Booking.start_time <= current_time.time(),
                Booking.end_time >= current_time.time(),
                Booking.status == 'approved'
            ).first()
            
            if booking:
                # Update occupancy status
                occupancy = OccupancyStatus(
                    lab_id=booking.lab_id,
                    faculty_id=faculty.id,
                    schedule_type='booking',
                    schedule_id=booking.id,
                    expected_start=datetime.combine(booking.booking_date, booking.start_time),
                    expected_end=datetime.combine(booking.booking_date, booking.end_time),
                    actual_start=current_time,
                    status='active'
                )
                
                self.db.session.add(occupancy)
                self.db.session.commit()
                
                print(f"[NFC] Lab {booking.lab_id} occupancy started for {faculty.full_name}")
                
                # Update lab status
                lab = Lab.query.get(booking.lab_id)
                if lab:
                    lab.status = 'occupied'
                    self.db.session.commit()
    
    def _monitor_pir(self):
        """Monitor PIR sensor for motion detection"""
        print(f"PIR monitoring started on GPIO{self.app.config['PIR_GPIO_PIN']}")
        
        last_state = False
        
        while self.running:
            try:
                current_state = GPIO.input(self.app.config['PIR_GPIO_PIN'])
                
                if current_state and not last_state:
                    # Motion detected
                    print("[PIR] Motion detected")
                    self._handle_pir_motion()
                    last_state = True
                    
                elif not current_state and last_state:
                    # Motion stopped
                    last_state = False
                
                # Check for timeouts in occupied labs
                self._check_pir_timeouts()
                
                time.sleep(0.5)  # Check twice per second
                
            except Exception as e:
                print(f"PIR monitoring error: {e}")
    
    def _handle_pir_motion(self):
        """Handle PIR motion detection"""
        with self.app.app_context():
            from models import OccupancyStatus, Lab
            
            # Update last motion time for all active occupancies
            occupancies = OccupancyStatus.query.filter_by(status='active').all()
            
            for occ in occupancies:
                occ.pir_last_motion = datetime.now()
                self.db.session.commit()
    
    def _check_pir_timeouts(self):
        """Check for PIR timeouts and release labs"""
        with self.app.app_context():
            from models import OccupancyStatus, Lab, AutoReleaseLogs
            
            current_time = datetime.now()
            
            occupancies = OccupancyStatus.query.filter_by(status='active').all()
            
            for occ in occupancies:
                if occ.pir_last_motion:
                    time_since_motion = current_time - occ.pir_last_motion
                    
                    if time_since_motion.total_seconds() > self.pir_timeout:
                        # PIR timeout reached - release the lab
                        print(f"[PIR] Timeout for lab {occ.lab_id}. Releasing.")
                        
                        # Update occupancy status
                        occ.status = 'pir_timeout'
                        occ.actual_end = current_time
                        occ.released_at = current_time
                        occ.pir_timeout_triggered = True
                        
                        # Update lab status
                        lab = Lab.query.get(occ.lab_id)
                        if lab:
                            lab.status = 'available'
                        
                        # Log the auto-release
                        release_log = AutoReleaseLogs(
                            lab_id=occ.lab_id,
                            occupancy_status_id=occ.id,
                            release_type='pir_timeout',
                            triggered_by='system',
                            original_status='active',
                            new_status='pir_timeout',
                            release_time=current_time,
                            notes=f'PIR timeout after {self.pir_timeout//60} minutes of no motion'
                        )
                        self.db.session.add(release_log)
                        
                        self.db.session.commit()
    
    def _on_mqtt_connect(self, client, userdata, flags, rc):
        """MQTT connection callback"""
        if rc == 0:
            print("MQTT Connected successfully")
            # Subscribe to all ilabs topics
            client.subscribe(self.app.config['MQTT_TOPIC_PREFIX'] + '#')
        else:
            print(f"MQTT Connection failed with code {rc}")
    
    def _on_mqtt_message(self, client, userdata, msg):
        """Handle incoming MQTT messages from ESP32"""
        try:
            payload = msg.payload.decode()
            topic = msg.topic
            
            print(f"[ESP32] {topic}: {payload}")
            
            # Process different ESP32 data
            if "temperature" in topic:
                self._handle_temperature_data(topic, payload)
            elif "door" in topic:
                self._handle_door_sensor(topic, payload)
            elif "emergency" in topic:
                self._handle_emergency_button(topic, payload)
                
        except Exception as e:
            print(f"Error processing MQTT message: {e}")
    
    def _handle_temperature_data(self, topic, payload):
        """Handle temperature readings from ESP32 sensors"""
        try:
            data = json.loads(payload)
            lab_id = topic.split('/')[-2]  # Extract lab ID from topic
            
            with self.app.app_context():
                from models import SystemLogs
                
                log = SystemLogs(
                    log_level='info',
                    component='esp32_temperature',
                    message=f'Temperature reading for lab {lab_id}',
                    details=json.dumps(data),
                    timestamp=datetime.now()
                )
                self.db.session.add(log)
                self.db.session.commit()
                
        except Exception as e:
            print(f"Error handling temperature data: {e}")
    
    def stop_monitoring(self):
        """Stop all sensor monitoring"""
        self.running = False
        GPIO.cleanup()
        
        if self.esp32_active:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
        
        print("Sensor monitoring stopped")