
import * as React from "react";

interface BookingConfirmationProps {
  heading: string;
  hello: string;
  body: string;
  detailsHeading: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  cta: string;
  contactText: string;
  footerText: string;
  bookingDate: string;
  bookingTime: string;
  bookingLocation: string;
  cancellationLink: string;
  cancellationLinkText: string;
}

export function BookingConfirmation({
  heading,
  hello,
  body,
  detailsHeading,
  dateLabel,
  timeLabel,
  locationLabel,
  cta,
  contactText,
  footerText,
  bookingDate,
  bookingTime,
  bookingLocation,
  cancellationLink,
  cancellationLinkText,
}: BookingConfirmationProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#4f46e5", padding: "20px", textAlign: "center" }}>
        <h1 style={{ color: "white", margin: 0 }}>{heading}</h1>
      </div>
      
      <div style={{ padding: "20px", border: "1px solid #e5e7eb", borderTop: "none" }}>
        <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
          {hello}
        </p>
        <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
          {body}
        </p>
        
        <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
          <h2 style={{ marginTop: 0 }}>{detailsHeading}</h2>
          <p><strong>{dateLabel}</strong> {bookingDate}</p>
          <p><strong>{timeLabel}</strong> {bookingTime}</p>
          <p><strong>{locationLabel}</strong> {bookingLocation}</p>
        </div>
        
        <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
          {cta}
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
            {cancellationLinkText}
          </a>
        </div>
        
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          {contactText}
        </p>
      </div>
      
      <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f9fafb", textAlign: "center", fontSize: "12px", color: "#6b7280" }}>
        <p>{footerText}</p>
      </div>
    </div>
  );
}