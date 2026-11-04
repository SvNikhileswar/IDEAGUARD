"""Builds data/projects.json (200 sample projects). Run once: python build_dataset.py"""
import json, os
P = {
 "Education": [
  ("Attendance", "marks and tracks student attendance in classrooms", ["Automatic attendance sheet", "Proxy attendance prevention", "Monthly attendance reports"]),
  ("Library", "simplifies book search, issue and return in college libraries", ["Book search", "Due date reminders", "Issue and return history"]),
  ("Notes", "helps students organise and share lecture notes", ["Subject-wise folders", "Note summaries", "Peer sharing"]),
  ("Timetable", "creates and updates class timetables and room allocation", ["Clash detection", "Room allocation", "Change notifications"]),
  ("Doubt", "answers student doubts quickly outside class hours", ["Question tagging", "Instant answers", "Teacher escalation"])],
 "Health": [
  ("Appointments", "reduces hospital OPD queues with appointment booking", ["Slot booking", "Queue status", "Reminders"]),
  ("Medicine", "reminds patients to take medicines on time", ["Dose reminders", "Prescription storage", "Refill alerts"]),
  ("Symptoms", "gives first-level guidance based on symptoms", ["Symptom checker", "Nearby clinics", "Emergency contacts"]),
  ("Records", "keeps patient health records in one place", ["Digital records", "Doctor sharing", "Report history"]),
  ("Elderly", "monitors the safety and health of elderly people at home", ["Fall detection", "Vitals tracking", "Family alerts"])],
 "Agriculture": [
  ("Crop Disease", "detects crop diseases from leaf photos", ["Disease detection", "Treatment advice", "Local language support"]),
  ("Irrigation", "optimises water use for irrigation", ["Soil moisture tracking", "Auto watering", "Water usage reports"]),
  ("Market Price", "shows live crop prices from nearby markets", ["Price tracking", "Best market finder", "Price alerts"]),
  ("Yield", "predicts crop yield for farmers", ["Yield prediction", "Weather inputs", "Season planning"]),
  ("Storage", "monitors grain storage conditions to reduce spoilage", ["Humidity monitoring", "Spoilage alerts", "Storage logs"])],
 "Finance": [
  ("Expenses", "tracks personal expenses and budgets", ["Expense categories", "Budget limits", "Monthly insights"]),
  ("Billing", "automates billing and invoicing for small shops", ["Invoice generation", "GST support", "Sales reports"]),
  ("Bill Reminder", "keeps track of monthly bills and due dates", ["Due date alerts", "Bill history", "Auto categorisation"]),
  ("Fraud", "detects suspicious payment activity", ["Anomaly detection", "Instant alerts", "Risk scores"]),
  ("Savings", "helps students build savings habits", ["Goal setting", "Round-up savings", "Progress tracking"])],
 "Transport": [
  ("Bus Tracking", "shows live bus locations and arrival times", ["Live location", "Arrival estimates", "Route search"]),
  ("Parking", "finds and manages parking spaces", ["Free slot detection", "Slot booking", "Payment"]),
  ("Carpool", "connects people for shared rides", ["Ride matching", "Cost splitting", "Safety checks"]),
  ("Traffic", "reduces congestion using traffic prediction", ["Congestion prediction", "Route suggestions", "Signal timing"]),
  ("Accident", "detects road accidents and alerts help", ["Crash detection", "Location sharing", "Emergency calls"])],
 "Environment": [
  ("Waste Segregation", "helps people segregate waste at source", ["Waste classification", "Bin guidance", "Reward points"]),
  ("Energy", "monitors electricity wastage in buildings", ["Usage monitoring", "Wastage alerts", "Savings tips"]),
  ("Water", "monitors water usage and leakage", ["Flow tracking", "Leak alerts", "Usage reports"]),
  ("Air Quality", "tracks local air quality", ["Live AQI", "Pollution alerts", "Area heatmap"]),
  ("Garbage Collection", "schedules garbage collection and reports missed pickups", ["Pickup schedule", "Complaint reporting", "Route tracking"])],
 "Accessibility": [
  ("Sign Language", "translates sign language to text", ["Gesture recognition", "Text output", "Learning mode"]),
  ("Blind Navigation", "guides visually impaired people while walking", ["Obstacle detection", "Voice guidance", "Location sharing"]),
  ("Captions", "creates live captions for lectures", ["Speech to text", "Multiple languages", "Transcript download"]),
  ("Reader", "reads printed text aloud", ["Text recognition", "Voice output", "Language choice"]),
  ("Voice Control", "lets users control devices by voice", ["Voice commands", "Custom commands", "Offline support"])],
 "Productivity": [
  ("Task Manager", "helps teams plan and track tasks", ["Task boards", "Deadlines", "Progress reports"]),
  ("Meetings", "schedules meetings and writes minutes", ["Slot finder", "Auto minutes", "Action items"]),
  ("Leave Approval", "streamlines leave requests and approvals", ["Request forms", "Approval chain", "Balance tracking"]),
  ("Certificates", "speeds up bonafide, NOC and ID card requests", ["Online requests", "Digital signatures", "Status tracking"]),
  ("Complaints", "tracks hostel and mess complaints to resolution", ["Complaint filing", "Status tracking", "Resolution feedback"])],
 "Food": [
  ("Mess Menu", "manages mess menus and reduces food waste", ["Menu voting", "Demand prediction", "Waste tracking"]),
  ("Recipes", "suggests recipes from available ingredients", ["Ingredient input", "Recipe suggestions", "Shopping list"]),
  ("Grocery", "plans grocery lists and reduces food wastage", ["Smart lists", "Expiry tracking", "Budget view"]),
  ("Canteen Queue", "removes long canteen queues with pre-ordering", ["Pre-ordering", "Pickup slots", "Payment"]),
  ("Donation", "connects surplus food with people in need", ["Surplus listing", "Pickup matching", "Impact stats"])],
 "Safety": [
  ("Women Safety", "improves personal safety with quick alerts", ["SOS button", "Live location", "Trusted contacts"]),
  ("Campus Security", "monitors entry and visitors on campus", ["Visitor logs", "ID checks", "Incident alerts"]),
  ("Disaster Alerts", "sends early warnings during disasters", ["Alert broadcast", "Safe zone maps", "Offline mode"]),
  ("Lost and Found", "helps people recover lost items", ["Item posting", "Photo matching", "Owner notifications"]),
  ("Fire", "detects fire early in buildings", ["Smoke detection", "Instant alarms", "Evacuation guidance"])],
}
A = [
 ("AI", "An AI-powered system using computer vision and machine learning that", ["Machine learning model", "Automated alerts"], ["Python", "TensorFlow", "Flask"], "GitHub"),
 ("App", "A mobile app that", ["Simple mobile interface", "Push notifications"], ["Flutter", "Firebase"], "Devpost"),
 ("IoT", "A low-cost IoT solution using sensors that", ["Sensor data capture", "Real-time monitoring"], ["Arduino", "ESP32", "MQTT"], "College"),
 ("Hub", "A web dashboard with a chatbot that", ["Central dashboard", "Chatbot assistant"], ["React", "Node.js", "MongoDB"], "GitHub"),
]
out, n = [], 0
for dom, probs in P.items():
    for short, action, feats in probs:
        for suf, intro, af, tech, src in A:
            n += 1
            out.append({"title": f"{short} {suf}", "domain": dom,
                "description": f"{intro} {action}.",
                "features": feats + af, "tech_stack": tech, "source": src,
                "url": f"https://example.com/projects/{n}"})
os.makedirs("data", exist_ok=True)
json.dump(out, open("data/projects.json", "w", encoding="utf-8"), indent=1)
print(len(out), "projects written")
