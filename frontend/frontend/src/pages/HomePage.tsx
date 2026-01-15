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
            // 1. Get current user to know Mongo ID
            const userResponse = await axios.get<UserProfile>(`${API_BACKEND}/me`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            const userId = userResponse.data.id;

            // 2. Apply to job
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

    if (loading) return <p>Loading...</p>;

    // --- ADMIN VIEW ---
    if (isAdmin) {
        // Filter Notifications
        const filteredNotifications = notifications.filter(n => 
            n.recipientEmail.toLowerCase().includes(notificationSearch.toLowerCase()) ||
            n.subject.toLowerCase().includes(notificationSearch.toLowerCase()) ||
            n.body.toLowerCase().includes(notificationSearch.toLowerCase())
        );

        return (
            <div style={{ padding: "2rem" }}>
                <h2>Admin Dashboard</h2>
                
                <h3>All Users</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
                            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Username</th>
                            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Email</th>
                            <th style={{ padding: "10px", border: "1px solid #ddd" }}>First Name</th>
                            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Last Name</th>
                            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.username}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.email}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.firstName}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.lastName}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                                    <button 
                                        onClick={() => handleDeleteUser(user.id)}
                                        style={{ backgroundColor: "#ff4444", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3>Notifications Log</h3>
                <div style={{ marginBottom: "1rem" }}>
                    <input 
                        type="text" 
                        placeholder="Search logs..." 
                        value={notificationSearch}
                        onChange={(e) => setNotificationSearch(e.target.value)}
                        style={{ padding: "8px", width: "300px" }}
                    />
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
                            <th style={{ padding: "10px", border: "1px solid #ddd" }}>To</th>
                            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Subject</th>
                            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Sent At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNotifications.map(notif => (
                            <tr key={notif.id}>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{notif.recipientEmail}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{notif.subject}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{new Date(notif.sentAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
        <div style={{ padding: "2rem" }}>
            <h2>Available Jobs</h2>
            
            {/* Filter Menu */}
            <div style={{ marginBottom: "2rem", padding: "1rem", backgroundColor: "#f9f9f9", borderRadius: "8px", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <input 
                    type="text" 
                    placeholder="Search by Title..." 
                    value={jobFilters.keyword}
                    onChange={(e) => { setJobFilters({...jobFilters, keyword: e.target.value}); setCurrentPage(1); }}
                    style={{ padding: "8px", flex: 1 }}
                />
                <input 
                    type="text" 
                    placeholder="Location..." 
                    value={jobFilters.location}
                    onChange={(e) => { setJobFilters({...jobFilters, location: e.target.value}); setCurrentPage(1); }}
                    style={{ padding: "8px", flex: 1 }}
                />
                <input 
                    type="text" 
                    placeholder="Company..." 
                    value={jobFilters.company}
                    onChange={(e) => { setJobFilters({...jobFilters, company: e.target.value}); setCurrentPage(1); }}
                    style={{ padding: "8px", flex: 1 }}
                />
            </div>

            <p style={{ marginBottom: "1rem" }}>Showing {displayedJobs.length} of {filteredJobs.length} jobs</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {displayedJobs.map((job) => (
                    <div key={job.id} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
                        <h3>{job.title}</h3>
                        <p><strong>{job.company}</strong> - {job.location}</p>
                        <div dangerouslySetInnerHTML={{ __html: job.description }} />
                        <div style={{ marginTop: "1rem" }}>
                            <a href={job.url} target="_blank" rel="noreferrer" style={{ marginRight: "1rem" }}>View Original</a>
                            <button onClick={() => handleApply(job)}>Apply Now</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1rem", alignItems: "center" }}>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{ padding: "8px 16px" }}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{ padding: "8px 16px" }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomePage;
