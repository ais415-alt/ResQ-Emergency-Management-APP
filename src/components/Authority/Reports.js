import React, { useEffect, useState } from 'react';
import { db, functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { Bar, Pie, Line } from 'react-chartjs-2';
import AdminLayout from '../Shared/AdminLayout';
import './Reports.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const Reports = () => {
  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [camps, setCamps] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incidentChartType, setIncidentChartType] = useState('time');
  const [activeUsers, setActiveUsers] = useState(0);
  const [apiResponseTimes, setApiResponseTimes] = useState({ submission: [], statusUpdate: [] });
  const [errorRates, setErrorRates] = useState({ server: [], client: [] });
  const [errorChartType, setErrorChartType] = useState('server');
  const [apiChartType, setApiChartType] = useState('submission');

  useEffect(() => {
    const unsubscribeIncidents = onSnapshot(collection(db, 'incidents'), snapshot => {
      setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, error => {
      console.error("Error fetching incidents: ", error);
      setLoading(false);
    });

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), snapshot => {
      const filteredUsers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role !== 'admin');
      setUsers(filteredUsers);
    });

    const unsubscribeCamps = onSnapshot(collection(db, 'camps'), snapshot => {
      setCamps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeNotifications = onSnapshot(collection(db, 'notifications'), snapshot => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeZones = onSnapshot(collection(db, 'zones'), snapshot => {
      setZones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeApiLogs = onSnapshot(collection(db, 'apiLogs'), snapshot => {
      const submissionTimes = [];
      const statusUpdateTimes = [];
      const serverErrors = [];
      const clientErrors = [];

      snapshot.docs.forEach(doc => {
        const log = doc.data();
        if (log.type === 'submission') {
          submissionTimes.push({ time: log.timestamp.toDate(), responseTime: log.responseTime });
        } else if (log.type === 'statusUpdate') {
          statusUpdateTimes.push({ time: log.timestamp.toDate(), responseTime: log.responseTime });
        }
        
        if (log.statusCode >= 500) {
          serverErrors.push({ time: log.timestamp.toDate(), errorCount: 1 });
        } else if (log.statusCode >= 400) {
          clientErrors.push({ time: log.timestamp.toDate(), errorCount: 1 });
        }
      });

      setApiResponseTimes({ submission: submissionTimes, statusUpdate: statusUpdateTimes });
      setErrorRates({ server: serverErrors, client: clientErrors });
    });

    return () => {
      unsubscribeApiLogs();
      unsubscribeIncidents();
      unsubscribeUsers();
      unsubscribeCamps();
      unsubscribeNotifications();
      unsubscribeZones();
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    const active = users.filter(user => {
      const lastActive = user.lastActive?.toDate();
      return lastActive && lastActive > fifteenMinutesAgo;
    }).length;

    setActiveUsers(active);
  }, [users]);

  const getUserDemographics = () => {
    const genderData = users.reduce((acc, user) => {
      const gender = user.gender && ['male', 'female'].includes(user.gender.toLowerCase()) ? user.gender.toLowerCase() : 'undefined';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, { male: 0, female: 0, undefined: 0 });

    return {
      labels: ['Male', 'Female', 'Undefined'],
      datasets: [{
        label: 'User Demographics by Gender',
        data: [genderData.male, genderData.female, genderData.undefined],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      }],
    };
  };

  const getIncidentsByTime = () => {
    const incidentsByHour = incidents.reduce((acc, incident) => {
      const date = new Date(incident.reportedAt?.seconds * 1000);
      const hour = date.toISOString().substring(0, 13); // Group by hour
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const sortedHours = Object.keys(incidentsByHour).sort();
    const data = sortedHours.map(hour => ({
      x: new Date(hour),
      y: incidentsByHour[hour]
    }));

    return {
      datasets: [{
        label: 'Incidents Over Time',
        data: data,
        fill: false,
        borderColor: '#FF6384',
      }],
    };
  };

  const getCampOccupancy = () => {
    return {
      labels: camps.map(camp => camp.name),
      datasets: [
        {
          label: 'Camp Occupancy',
          data: camps.map(camp => camp.occupancy || 0),
          backgroundColor: '#36A2EB',
        },
        {
          label: 'Camp Capacity',
          data: camps.map(camp => camp.capacity || 0),
          backgroundColor: '#FFCE56',
        }
      ],
    };
  };

  const getUsersByZone = () => {
    const usersByZone = zones.map(zone => {
      const usersInZone = users.filter(user => {
        // This is a placeholder for the logic to determine if a user is in a zone.
        // You'll need to implement a point-in-polygon algorithm.
        return false;
      }).length;
      return { zone: zone.name, count: usersInZone };
    });

    return {
      labels: usersByZone.map(item => item.zone),
      datasets: [{
        label: 'Users by Zone',
        data: usersByZone.map(item => item.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
      }],
    };
  };

  const getIncidentsBySeverity = () => {
    const incidentsBySeverity = incidents.reduce((acc, incident) => {
      const severity = incident.severity || 'Unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(incidentsBySeverity),
      datasets: [{
        label: 'Incidents by Severity',
        data: Object.values(incidentsBySeverity),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      }],
    };
  };

  const getApiResponseTimes = () => {
    const data = apiChartType === 'submission' ? apiResponseTimes.submission : apiResponseTimes.statusUpdate;
    const label = apiChartType === 'submission' ? 'Incident Submission' : 'Status Update';
    return {
      datasets: [{
        label: `${label} Response Times (ms)`,
        data: data.map(item => ({ x: item.time, y: item.responseTime })),
        fill: false,
        borderColor: '#4BC0C0',
      }],
    };
  };

  const getErrorRates = () => {
    const data = errorChartType === 'server' ? errorRates.server : errorRates.client;
    return {
      datasets: [{
        label: `${errorChartType.charAt(0).toUpperCase() + errorChartType.slice(1)} Error Rates`,
        data: data.map(item => ({ x: item.time, y: item.errorCount })),
        fill: false,
        borderColor: '#FF9F40',
      }],
    };
  };

  const downloadPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    let yPos = 40;

    // Header
    pdf.setFontSize(20);
    pdf.text("ResQ Emergency Report", pdfWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pdfWidth / 2, 30, { align: 'center' });

    // Summary
    pdf.setFontSize(16);
    pdf.text("Summary", 14, yPos);
    yPos += 10;
    pdf.setFontSize(12);
    pdf.text(`- Total Users: ${users.length}`, 14, yPos);
    yPos += 10;
    pdf.text(`- Total Incidents: ${incidents.length}`, 14, yPos);
    yPos += 10;
    pdf.text(`- Active Camps: ${camps.length}`, 14, yPos);
    yPos += 20;

    const sections = document.querySelectorAll('.feature-section');
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const title = section.querySelector('h2').textContent;
      const charts = section.querySelectorAll('.chart-container');

      if (yPos + 20 > pdfHeight - 20) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(16);
      pdf.text(title, 14, yPos);
      yPos += 10;

      for (let j = 0; j < charts.length; j++) {
        const chart = charts[j];
        const canvas = await html2canvas(chart, {
          backgroundColor: '#111827',
          ignoreElements: (element) => element.classList.contains('btn-group'),
        });
        const imgData = canvas.toDataURL('image/png');
        const chartHeight = (canvas.height * (pdfWidth - 28)) / canvas.width;

        if (yPos + chartHeight > pdfHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.addImage(imgData, 'PNG', 14, yPos, pdfWidth - 28, chartHeight);
        yPos += chartHeight + 10;

        // Generate and add AI summary
        const chartType = chart.dataset.chartType;
        const data = getChartData(chartType);
        const generateReport = httpsCallable(functions, 'generateReport');
        const { data: { summary } } = await generateReport({ chartType, data });
        pdf.setFontSize(12);
        pdf.text("AI Summary:", 14, yPos);
        yPos += 5;
        pdf.text(summary, 14, yPos, { maxWidth: pdfWidth - 28 });
        yPos += 20;
      }
    }

    // Footer
    const pageCount = pdf.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(`Page ${i} of ${pageCount}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      pdf.text("ResQ Emergency Management", 14, pdfHeight - 10);
    }

    pdf.save("reports.pdf");
  };

  const getChartData = (chartType) => {
    switch (chartType) {
      case "userDemographics":
        return users;
      case "incidentsByTime":
        return incidents;
      case "campOccupancy":
        return camps;
      case "systemPerformance":
        return { apiResponseTimes, errorRates };
      default:
        return null;
    }
  };

  if (loading) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div id="reports-page">
        <h1>Reports</h1>
        <button onClick={downloadPDF} className="btn btn-primary">Download PDF</button>
        <div className="report-grid">
        <div className="feature-section">
          <h2>User Demographics & Population Analysis</h2>
          <div className="dashboard-cards">
            <div className="card">
              <h3>Total Users</h3>
              <p className="count">{users.length}</p>
            </div>
          </div>
          <div className="demographics-container">
            <div className="chart-container" data-chart-type="userDemographics">
              <Pie data={getUserDemographics()} />
            </div>
            <div className="chart-container" data-chart-type="usersByZone">
              <Bar data={getUsersByZone()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Users by Zone',
                    },
                  },
                  scales: {
                    x: {
                      display: false,
                    },
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        <div className="feature-section">
          <h2>Incident Reporting & Needs Analysis</h2>
          <div className="btn-group">
            <button onClick={() => setIncidentChartType('time')} className={`btn ${incidentChartType === 'time' ? 'btn-primary' : 'btn-secondary'}`}>
              By Time
            </button>
            <button onClick={() => setIncidentChartType('severity')} className={`btn ${incidentChartType === 'severity' ? 'btn-primary' : 'btn-secondary'}`}>
              By Severity
            </button>
          </div>
          <div className="chart-container" data-chart-type="incidentsByTime">
            {incidentChartType === 'time' ? (
              <Line
                data={getIncidentsByTime()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Incidents Over Time',
                    },
                  },
                  scales: {
                    x: {
                      type: 'time',
                      time: {
                        unit: 'hour',
                        displayFormats: {
                          hour: 'MMM d, HH:mm'
                        }
                      },
                      title: {
                        display: true,
                        text: 'Time'
                      }
                    },
                    y: {
                      beginAtZero: true,
                      suggestedMax: 10,
                    },
                  },
                }}
              />
            ) : (
              <Bar
                data={getIncidentsBySeverity()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Incidents by Severity',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      suggestedMax: 10,
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
        <div className="feature-section">
          <h2>Logistics & Camp Management</h2>
          <div className="chart-container" data-chart-type="campOccupancy">
            <Bar
              data={getCampOccupancy()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Camp Occupancy vs. Capacity',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    suggestedMax: 50,
                  },
                },
                barThickness: 50,
              }}
            />
          </div>
        </div>
        <div className="feature-section">
          <h2>System Performance & Activity</h2>
          <div className="dashboard-cards">
            <div className="card">
              <h3>Active Users</h3>
              <p className="count">{activeUsers}</p>
            </div>
            <div className="card">
              <h3>Total Incidents</h3>
              <p className="count">{incidents.length}</p>
            </div>
            <div className="card">
              <h3>Recent Notifications</h3>
              <p className="count">{notifications.length}</p>
            </div>
          </div>
          <div className="performance-container">
            <div className="chart-container" data-chart-type="systemPerformance">
              <div className="btn-group">
                <button onClick={() => setApiChartType('submission')} className={`btn ${apiChartType === 'submission' ? 'btn-primary' : 'btn-secondary'}`}>
                  Submission
                </button>
                <button onClick={() => setApiChartType('statusUpdate')} className={`btn ${apiChartType === 'statusUpdate' ? 'btn-primary' : 'btn-secondary'}`}>
                  Status Update
                </button>
              </div>
              <Line data={getApiResponseTimes()} options={{
                responsive: true,
                maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'API Response Times',
                },
              },
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: 'hour',
                    displayFormats: {
                      hour: 'MMM d, HH:mm'
                    }
                  },
                },
                y: {
                  suggestedMax: 500,
                }
              },
            }} />
            </div>
            <div className="chart-container">
              <div className="btn-group">
                <button onClick={() => setErrorChartType('server')} className={`btn ${errorChartType === 'server' ? 'btn-primary' : 'btn-secondary'}`}>
                  Server Errors
                </button>
                <button onClick={() => setErrorChartType('client')} className={`btn ${errorChartType === 'client' ? 'btn-primary' : 'btn-secondary'}`}>
                  Client Errors
                </button>
              </div>
              <Line data={getErrorRates()} options={{
                responsive: true,
                maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Error Rates',
                },
              },
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: 'hour',
                    displayFormats: {
                      hour: 'MMM d, HH:mm'
                    }
                  },
                },
                y: {
                  suggestedMax: 10,
                }
              },
            }} />
            </div>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;