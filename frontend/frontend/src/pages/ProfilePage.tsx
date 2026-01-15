import { useEffect, useState } from "react";
import axios from "axios";
import type { UserProfile } from "../types";
import type { Preferences } from "../types";
import keycloak from "../keycloak";

const API_BACKEND = "/api/users";

const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [preferences, setPreferences] = useState<Preferences>({
        desiredRole: "",
        locations: [],
        jobType: "Full-time",
        minSalary: 0
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (keycloak.authenticated) {
            fetchProfile();
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get<UserProfile>(`${API_BACKEND}/me`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            setProfile(response.data);
            if (response.data.preferences) {
                setPreferences(response.data.preferences);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleSavePreferences = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            await axios.put(`${API_BACKEND}/${profile.id}/preferences`, preferences, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            alert("Preferences saved!");
        } catch (error) {
            console.error("Error saving preferences:", error);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (!keycloak.authenticated) return <p>Please login to view profile.</p>;
    if (!profile) return <p>Loading profile...</p>;

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            <h2>My Profile</h2>
            <div style={{ marginBottom: "2rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Username:</strong> {profile.username}</p>
                <p><strong>Roles:</strong> {profile.roles.join(", ")}</p>
            </div>

            <h3>Job Preferences</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <label>
                    Desired Role:
                    <input 
                        type="text"
                        value={preferences.desiredRole || ""} 
                        onChange={(e) => setPreferences({ ...preferences, desiredRole: e.target.value })}
                        style={{ marginLeft: "1rem", padding: "0.5rem" }}
                        placeholder="e.g. Java Developer"
                    />
                </label>

                <label>
                    Locations (comma separated):
                    <input 
                        type="text"
                        value={preferences.locations?.join(", ") || ""} 
                        onChange={(e) => setPreferences({ ...preferences, locations: e.target.value.split(",").map(s => s.trim()) })}
                        style={{ marginLeft: "1rem", padding: "0.5rem" }}
                        placeholder="e.g. Remote, Bucharest"
                    />
                </label>

                <label>
                    Job Type:
                    <select 
                        value={preferences.jobType || "Full-time"} 
                        onChange={(e) => setPreferences({ ...preferences, jobType: e.target.value })}
                        style={{ marginLeft: "1rem", padding: "0.5rem" }}
                    >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                </label>

                <label>
                    Minimum Salary (€):
                    <input 
                        type="number" 
                        value={preferences.minSalary || 0} 
                        onChange={(e) => setPreferences({ ...preferences, minSalary: Number(e.target.value) })}
                        style={{ marginLeft: "1rem", padding: "0.5rem" }}
                    />
                </label>

                <button onClick={handleSavePreferences} disabled={saving} style={{ padding: "0.5rem 1rem", marginTop: "1rem", cursor: "pointer" }}>
                    {saving ? "Saving..." : "Save Preferences"}
                </button>
            </div>

            {profile.jobs && profile.jobs.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h3>Applied Jobs</h3>
                    <ul>
                        {profile.jobs.map((job: any, index) => (
                            <li key={index}>
                                <strong>{job.title}</strong> at {job.company} (Applied: {job.appliedAt})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
