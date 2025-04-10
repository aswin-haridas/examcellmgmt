import React from 'react';

const NotificationPage = () => {
    const notifications = [
        {
            id: 1,
            title: 'Seating Arrangement Published',
            message: 'The seating arrangement for the upcoming exams has been published. Please check your respective rooms.',
            date: '2023-10-01',
        },
        {
            id: 2,
            title: 'Exam Guidelines Updated',
            message: 'New guidelines for the exams have been updated. Make sure to review them before the exam day.',
            date: '2023-09-28',
        },
        {
            id: 3,
            title: 'Hall Ticket Distribution',
            message: 'Hall tickets will be distributed starting from 2023-10-03. Collect yours from the exam cell.',
            date: '2023-09-25',
        },
    ];

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Notifications</h1>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {notifications.map((notification) => (
                    <li
                        key={notification.id}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            padding: '15px',
                            marginBottom: '10px',
                            backgroundColor: '#f9f9f9',
                        }}
                    >
                        <h2 style={{ margin: '0 0 10px' }}>{notification.title}</h2>
                        <p style={{ margin: '0 0 5px' }}>{notification.message}</p>
                        <small style={{ color: '#555' }}>Date: {notification.date}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationPage;