import * as React from "react";

interface BookingConfirmationProps {
  trainerName: string;
  bookingDate: string;
  bookingTime: string;
  bookingLocation: string;
  cancellationLink: string;
}

export function BookingConfirmation({
  trainerName,
  bookingDate,
  bookingTime,
  bookingLocation,
  cancellationLink,
}: BookingConfirmationProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#4f46e5", padding: "20px", textAlign: "center" }}>
        <h1 style={{ color: "white", margin: 0 }}>Your Training Session is Confirmed!</h1>
      </div>
      
      <div style={{ padding: "20px", border: "1px solid #e5e7eb", borderTop: "none" }}>
        <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
          Hello,
        </p>
        <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
          Your training session with {trainerName} has been successfully booked.
        </p>
        
        <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
          <h2 style={{ marginTop: 0 }}>Booking Details</h2>
          <p><strong>Date:</strong> {bookingDate}</p>
          <p><strong>Time:</strong> {bookingTime}</p>
          <p><strong>Location:</strong> {bookingLocation}</p>
        </div>
        
        <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
          We're looking forward to helping you achieve your fitness goals!
        </p>
        
        <div style={{ margin: "30px 0", textAlign: "center" }}>
          <a
            href={cancellationLink}
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "#ef4444",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            Cancel Booking
          </a>
        </div>
        
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          Need to make changes? Please contact your trainer directly or reply to this email.
        </p>
      </div>
      
      <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f9fafb", textAlign: "center", fontSize: "12px", color: "#6b7280" }}>
        <p>© {new Date().getFullYear()} ZIRO.FIT - All rights reserved</p>
      </div>
    </div>
  );
}