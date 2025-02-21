// Firebase setup
const storage = firebase.storage();
const db = firebase.firestore();

// Track progress
let progress = {
    "Team Prez": 0, "Team Sheehan": 0, "Team Skibbie": 0, "Team Cauthren": 0,
    totalWorkouts: 0, totalRaised: 0
};

// Handle form submission
document.getElementById('workoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const team = document.getElementById('team').value;
    const date = document.getElementById('date').value;
    const photo = document.getElementById('photo').files[0];
    const notes = document.getElementById('notes').value;
    const status = document.getElementById('status');

    status.textContent = 'Uploading...';

    try {
        // Upload photo to Firebase Storage
        const photoRef = storage.ref(`workouts/${Date.now()}_${photo.name}`);
        await photoRef.put(photo);
        const photoUrl = await photoRef.getDownloadURL();

        // Save workout data to Firestore
        await db.collection('workouts').add({
            name, team, date, photoUrl, notes,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update progress (assuming $0.50 pledge per workout)
        progress[team]++;
        progress.totalWorkouts++;
        progress.totalRaised += 0.50;

        // Update UI
        document.getElementById('total-workouts').textContent = progress.totalWorkouts;
        document.getElementById('total-raised').textContent = progress.totalRaised.toFixed(2);
        document.querySelector(`#team-rankings li:nth-child(${['Team Prez', 'Team Sheehan', 'Team Skibbie', 'Team Cauthren'].indexOf(team) + 1}) span`).textContent = progress[team];

        status.textContent = 'Workout submitted successfully!';
        document.getElementById('workoutForm').reset();
    } catch (error) {
        status.textContent = 'Error submitting workout: ' + error.message;
    }
});

// Load initial progress from Firestore
db.collection('workouts').onSnapshot((snapshot) => {
    progress = { "Team Prez": 0, "Team Sheehan": 0, "Team Skibbie": 0, "Team Cauthren": 0, totalWorkouts: 0, totalRaised: 0 };
    snapshot.forEach(doc => {
        const data = doc.data();
        progress[data.team]++;
        progress.totalWorkouts++;
        progress.totalRaised += 0.50;
    });
    document.getElementById('total-workouts').textContent = progress.totalWorkouts;
    document.getElementById('total-raised').textContent = progress.totalRaised.toFixed(2);
    document.querySelector('#team-rankings li:nth-child(1) span').textContent = progress["Team Prez"];
    document.querySelector('#team-rankings li:nth-child(2) span').textContent = progress["Team Sheehan"];
    document.querySelector('#team-rankings li:nth-child(3) span').textContent = progress["Team Skibbie"];
    document.querySelector('#team-rankings li:nth-child(4) span').textContent = progress["Team Cauthren"];
});