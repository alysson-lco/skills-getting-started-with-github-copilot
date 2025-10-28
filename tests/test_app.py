import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_list_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_for_activity():
    # Use a valid activity name from the app
    activities = client.get("/activities").json()
    activity_name = next(iter(activities.keys()))
    email = "testuser@mergington.edu"
    response = client.post("/signup", json={"email": email, "activity": activity_name})
    assert response.status_code == 200 or response.status_code == 400
    # Try to sign up again (should fail)
    response2 = client.post("/signup", json={"email": email, "activity": activity_name})
    assert response2.status_code == 400

def test_activity_participants():
    activities = client.get("/activities").json()
    activity_name = next(iter(activities.keys()))
    email = "testuser2@mergington.edu"
    client.post("/signup", json={"email": email, "activity": activity_name})
    response = client.get(f"/activities/{activity_name}")
    assert response.status_code == 200
    data = response.json()
    assert email in data["participants"]
