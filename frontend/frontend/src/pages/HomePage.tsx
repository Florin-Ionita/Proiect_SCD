import { useEffect, useState } from "react";
import axios from "axios";
import type { Job, UserProfile } from "../types";
import keycloak from "../keycloak";

const API_JOB_SERVICE = "http://localhost:8082/api/jobs";
const API_BACKEND = "http://localhost:8081/api/users";

const HomePage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

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

    if (loading) return <p>Loading jobs...</p>;

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Available Jobs</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {jobs.map((job) => (
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
        </div>
    );
};

export default HomePage;
