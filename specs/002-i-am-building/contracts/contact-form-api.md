# Contact Form API Contract

## Endpoint: Submit Contact Form

**URL**: `POST /wp-json/historic-equity/v1/contact`

### Request Schema

```json
{
  "type": "object",
  "required": ["name", "email", "project_location", "property_type", "project_description"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100,
      "description": "Contact person full name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "maxLength": 255,
      "description": "Valid email address"
    },
    "phone": {
      "type": "string",
      "pattern": "^[\\d\\s\\(\\)\\-\\+\\.]+$",
      "maxLength": 20,
      "description": "Phone number (optional)"
    },
    "company": {
      "type": "string",
      "maxLength": 100,
      "description": "Company or organization name (optional)"
    },
    "project_location": {
      "type": "string",
      "minLength": 5,
      "maxLength": 200,
      "description": "Property address or city/state"
    },
    "property_type": {
      "type": "string",
      "enum": ["Commercial", "Residential", "Industrial", "Institutional", "Mixed-Use"],
      "description": "Type of historic property"
    },
    "project_timeline": {
      "type": "string",
      "enum": ["0-6 months", "6-12 months", "1-2 years", "2+ years", "Planning phase"],
      "description": "Expected project start timeframe"
    },
    "estimated_budget": {
      "type": "string",
      "enum": ["$100K-$500K", "$500K-$1M", "$1M-$5M", "$5M+", "Not sure"],
      "description": "Estimated project investment range (optional)"
    },
    "project_description": {
      "type": "string",
      "minLength": 20,
      "maxLength": 2000,
      "description": "Brief description of the historic preservation project"
    },
    "referral_source": {
      "type": "string",
      "enum": ["Google Search", "Referral", "Event", "Social Media", "Other"],
      "description": "How the contact found Historic Equity (optional)"
    },
    "consent_marketing": {
      "type": "boolean",
      "default": false,
      "description": "Consent to receive marketing communications"
    }
  }
}
```

### Response Schema

#### Success Response (201 Created)
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "const": true
    },
    "message": {
      "type": "string",
      "example": "Thank you for your inquiry. We'll contact you within 24 hours."
    },
    "lead_id": {
      "type": "string",
      "description": "Unique identifier for the submitted lead"
    },
    "next_steps": {
      "type": "string",
      "description": "Information about what happens next"
    }
  },
  "required": ["success", "message", "lead_id"]
}
```

#### Error Response (400 Bad Request)
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "const": false
    },
    "message": {
      "type": "string",
      "example": "Validation failed"
    },
    "errors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": {
            "type": "string",
            "description": "Field name with error"
          },
          "message": {
            "type": "string",
            "description": "Error description"
          }
        }
      }
    }
  },
  "required": ["success", "message", "errors"]
}
```

### Business Rules

1. **Lead Deduplication**: Check for duplicate submissions within 24 hours based on email + project_location
2. **State Validation**: Verify project_location maps to a state served by Historic Equity
3. **Lead Scoring**: Assign priority score based on budget range and timeline
4. **Notification Routing**: Send alerts to appropriate team based on project size and location
5. **Compliance**: Log consent for marketing communications per GDPR/CAN-SPAM

### Implementation Requirements

- WordPress REST API endpoint registration
- Custom validation for all required fields
- Email notification to Historic Equity team
- CRM integration for lead management
- Form submission logging for analytics
- Rate limiting to prevent spam (max 3 submissions per IP per hour)
- Honeypot field for spam prevention
- CSRF token validation for security