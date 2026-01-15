import { useEffect, useState } from "react";
import axios from "axios";
import type { Job, UserProfile, NotificationLog } from "../types";
import keycloak from "../keycloak";

const API_JOB_SERVICE = "/api/jobs";
const API_BACKEND = "/api/users";

const HomePage = () => {
    // General State
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Admin State
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [notifications, setNotifications] = useState<NotificationLog[]>([]);
    const [notificationSearch, setNotificationSearch] = useState("");

    // Job Filter State
    const [jobFilters, setJobFilters] = useState({
        keyword: "",
        location: "",
        company: ""
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const isAdmin = keycloak.hasRealmRole("app_admin");

    useEffect(() => {
        if (isAdmin) {
            fetchAdminData();
        } else {
            fetchJobs();
        }
    }, [isAdmin]);

    const fetchJobs = async () => {
        try {
            const response = await axios.get<Job[]>(API_JOB_SERVICE);
            setJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminData = async () => {
        try {
            const [usersRes, notifRes] = await Promise.all([
                axios.get<UserProfile[]>(API_BACKEND, {
                    headers: { Authorization: `Bearer ${keycloak.token}` }
                }),
                axios.get<NotificationLog[]>(`${API_BACKEND}/notifications`, {
                    headers: { Authorization: `Bearer ${keycloak.token}` }
                })
            ]);
            setUsers(usersRes.data);
            setNotifications(notifRes.data);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`${API_BACKEND}/${userId}`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            setUsers(users.filter(u => u.id !== userId));
            alert("User deleted");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        }
    };

    const handleApply = async (job: Job) => {
        if (!keycloak.authenticated) {
            keycloak.login();
            return;
        }

        try {
            // Get current user to know Mongo ID
            const userResponse = await axios.get<UserProfile>(`${API_BACKEND}/me`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            const userId = userResponse.data.id;

            // Apply to job
            await axios.post(`${API_BACKEND}/${userId}/jobs`, {
                externalId: job.id,
                title: job.title,
                company: job.company,
                location: job.location, // Note: JobDto has 'location'?, Job model has 'location'
                url: job.url
            }, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });

            alert(`Applied to ${job.title} successfully!`);
        } catch (error) {
            console.error("Error applying to job:", error);
            alert("Failed to apply.");
        }
    };

    if (loading) return <p style={{ color: 'var(--primary-color)' }}>Loading data...</p>;

    // --- ADMIN VIEW ---
    if (isAdmin) {
        // Filter Notifications
        const filteredNotifications = notifications.filter(n => 
            n.recipientEmail.toLowerCase().includes(notificationSearch.toLowerCase()) ||
            n.subject.toLowerCase().includes(notificationSearch.toLowerCase()) ||
            n.body.toLowerCase().includes(notificationSearch.toLowerCase())
        );

        return (
            <div>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent-orange)' }}>Admin Dashboard</h2>
                
                <div className="glass-panel" style={{ marginBottom: '3rem' }}>
                    <h3 style={{ marginTop: 0 }}>Users</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Username</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Email</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>First Name</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Last Name</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ background: 'rgba(255,255,255,0.4)' }}>
                                        <td style={{ padding: '1rem', borderRadius: '12px 0 0 12px' }}>{user.username}</td>
                                        <td style={{ padding: '1rem' }}>{user.email}</td>
                                        <td style={{ padding: '1rem' }}>{user.firstName}</td>
                                        <td style={{ padding: '1rem' }}>{user.lastName}</td>
                                        <td style={{ padding: '1rem', borderRadius: '0 12px 12px 0' }}>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                style={{ 
                                                    backgroundColor: "#ef4444", 
                                                    color: 'white',
                                                    padding: "0.5rem 1rem", 
                                                    fontSize: "0.85rem",
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Notification Logs</h3>
                        <input 
                            type="text" 
                            placeholder="Search logs..." 
                            value={notificationSearch}
                            onChange={(e) => setNotificationSearch(e.target.value)}
                            style={{ width: "320px" }}
                        />
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Recipient</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Subject</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredNotifications.map(notif => (
                                    <tr key={notif.id} style={{ background: 'rgba(255,255,255,0.4)' }}>
                                        <td style={{ padding: '1rem', borderRadius: '12px 0 0 12px' }}>{notif.recipientEmail}</td>
                                        <td style={{ padding: '1rem' }}>{notif.subject}</td>
                                        <td style={{ padding: '1rem', borderRadius: '0 12px 12px 0' }}>{new Date(notif.sentAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- REGULAR USER / GUEST VIEW ---
    // Filter Jobs
    const filteredJobs = jobs.filter(job => {
        const matchKeyword = !jobFilters.keyword || job.title.toLowerCase().includes(jobFilters.keyword.toLowerCase());
        const matchLocation = !jobFilters.location || job.location.toLowerCase().includes(jobFilters.location.toLowerCase());
        const matchCompany = !jobFilters.company || job.company.toLowerCase().includes(jobFilters.company.toLowerCase());
        return matchKeyword && matchLocation && matchCompany;
    });

    // Pagination
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const displayedJobs = filteredJobs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div>
            <h2>Find Your Next Role</h2>
            
            {/* Filter Menu */}
            <div className="filter-bar">
                <input 
                    type="text" 
                    placeholder="Job title..." 
                    value={jobFilters.keyword}
                    onChange={(e) => { setJobFilters({...jobFilters, keyword: e.target.value}); setCurrentPage(1); }}
                />
                <input 
                    type="text" 
                    placeholder="Location..." 
                    value={jobFilters.location}
                    onChange={(e) => { setJobFilters({...jobFilters, location: e.target.value}); setCurrentPage(1); }}
                />
                <input 
                    type="text" 
                    placeholder="Company..." 
                    value={jobFilters.company}
                    onChange={(e) => { setJobFilters({...jobFilters, company: e.target.value}); setCurrentPage(1); }}
                />
            </div>

            <p style={{ marginBottom: "2rem", color: "#6b7280", fontSize: "0.95rem" }}>
                Showing {displayedJobs.length} of {filteredJobs.length} positions
            </p>

            <div className="grid-layout">
                {displayedJobs.map((job) => (
                    <div key={job.id} className="card">
                        <h3>{job.title}</h3>
                        <p style={{ color: "#6b7280", marginBottom: "1rem", fontSize: "0.95rem" }}>
                            {job.company} · {job.location}
                        </p>
                        <div 
                            dangerouslySetInnerHTML={{ __html: job.description }} 
                            style={{ fontSize: "0.9rem", color: "#4b5563", maxHeight: "120px", overflow: "hidden", marginBottom: "1.5rem", lineHeight: "1.6" }} 
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                            <a href={job.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.85rem" }}>View details →</a>
                            <button onClick={() => handleApply(job)} style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>Apply</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center", gap: "1rem", alignItems: "center" }}>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{ padding: "0.6rem 1.25rem" }}
                    >
                        ← Previous
                    </button>
                    <span style={{ color: "#6b7280", fontWeight: "500" }}>Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{ padding: "0.6rem 1.25rem" }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomePage;
