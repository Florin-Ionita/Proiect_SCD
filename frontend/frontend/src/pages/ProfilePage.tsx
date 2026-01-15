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
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent-orange)' }}>My Profile</h2>
            
            <div className="glass-panel" style={{ marginBottom: "2rem" }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Name</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>{profile.firstName} {profile.lastName}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Email</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>{profile.email}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Username</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>{profile.username}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Roles</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {profile.roles.map(role => (
                                <span key={role} style={{ 
                                    background: 'var(--primary-color)', 
                                    color: 'white', 
                                    padding: '0.25rem 0.75rem', 
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500'
                                }}>{role}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                <h3 style={{ marginTop: 0 }}>Job Preferences</h3>
                <div style={{ display: "flex", flexDirection: "row", gap: "1.5rem" }}>
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '500' }}>Desired Role</span>
                            <input 
                                type="text"
                                value={preferences.desiredRole || ""} 
                                onChange={(e) => setPreferences({ ...preferences, desiredRole: e.target.value })}
                                placeholder="e.g. Java Developer"
                                style={{ width: '100%' }}
                            />
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '500' }}>Locations</span>
                            <input 
                                type="text"
                                value={preferences.locations?.join(", ") || ""} 
                                onChange={(e) => setPreferences({ ...preferences, locations: e.target.value.split(",").map(s => s.trim()) })}
                                placeholder="e.g. Remote, Bucharest"
                                style={{ width: '100%' }}
                            />
                        </label>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '500' }}>Job Type</span>
                            <select 
                                value={preferences.jobType || "Full-time"} 
                                onChange={(e) => setPreferences({ ...preferences, jobType: e.target.value })}
                                style={{ width: '100%' }}
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '500' }}>Minimum Salary (€)</span>
                            <input 
                                type="number" 
                                value={preferences.minSalary || 0} 
                                onChange={(e) => setPreferences({ ...preferences, minSalary: Number(e.target.value) })}
                                style={{ width: '100%' }}
                            />
                        </label>
                    </div>

                    <button 
                        onClick={handleSavePreferences} 
                        disabled={saving}
                        className="btn-primary"
                        style={{ alignSelf: 'flex-start', marginTop: '1rem' }}
                    >
                        {saving ? "Saving..." : "Save Preferences"}
                    </button>
                </div>
            </div>

            {profile.jobs && profile.jobs.length > 0 && (
                <div className="glass-panel" style={{ marginTop: "2rem" }}>
                    <h3 style={{ marginTop: 0 }}>Applied Jobs</h3>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
                        {profile.jobs.map((job: any, index) => (
                            <li key={index} style={{ 
                                padding: '1rem', 
                                background: 'rgba(255,255,255,0.5)', 
                                borderRadius: '12px',
                                borderLeft: '4px solid var(--accent-green)'
                            }}>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{job.title}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.9rem', color: '#666' }}>
                                    <span>{job.company}</span>
                                    <span>Applied: {job.appliedAt}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
