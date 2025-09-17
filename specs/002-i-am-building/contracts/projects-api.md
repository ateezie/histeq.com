# Projects API Contract

## Endpoint: Get Project Showcases

**URL**: `GET /wp-json/historic-equity/v1/projects`

### Query Parameters

```
state (optional): string - Filter projects by state code (e.g., "MO", "IL")
property_type (optional): string - Filter by property type enum value
featured (optional): boolean - Show only featured projects
limit (optional): integer - Number of projects to return (default: 12, max: 50)
offset (optional): integer - Pagination offset (default: 0)
```

### Response Schema

#### Success Response (200 OK)
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "const": true
    },
    "projects": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "description": "WordPress post ID"
          },
          "title": {
            "type": "string",
            "description": "Project name"
          },
          "location": {
            "type": "string",
            "description": "City, State format"
          },
          "state": {
            "type": "string",
            "description": "Two-letter state code"
          },
          "property_type": {
            "type": "string",
            "enum": ["Commercial", "Residential", "Industrial", "Institutional", "Mixed-Use"]
          },
          "year_completed": {
            "type": "integer",
            "description": "Project completion year"
          },
          "investment_amount": {
            "type": "string",
            "description": "Investment range display text"
          },
          "tax_credits_generated": {
            "type": "string",
            "description": "SHTC value display text"
          },
          "description": {
            "type": "string",
            "description": "Project description"
          },
          "featured_image": {
            "type": "object",
            "properties": {
              "url": {"type": "string"},
              "alt": {"type": "string"},
              "width": {"type": "integer"},
              "height": {"type": "integer"}
            }
          },
          "gallery_images": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "url": {"type": "string"},
                "alt": {"type": "string"},
                "width": {"type": "integer"},
                "height": {"type": "integer"}
              }
            }
          },
          "client_testimonial": {
            "type": "string",
            "description": "Client quote (optional)"
          },
          "client_name": {
            "type": "string",
            "description": "Client name for testimonial (optional)"
          },
          "project_highlights": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Key benefits/outcomes"
          },
          "featured": {
            "type": "boolean",
            "description": "Featured on homepage"
          },
          "slug": {
            "type": "string",
            "description": "URL-friendly project identifier"
          }
        },
        "required": ["id", "title", "location", "state", "property_type", "year_completed", "description", "featured_image"]
      }
    },
    "total": {
      "type": "integer",
      "description": "Total number of projects matching filters"
    },
    "pagination": {
      "type": "object",
      "properties": {
        "current_page": {"type": "integer"},
        "total_pages": {"type": "integer"},
        "has_next": {"type": "boolean"},
        "has_previous": {"type": "boolean"}
      }
    }
  },
  "required": ["success", "projects", "total", "pagination"]
}
```

## Endpoint: Get Single Project

**URL**: `GET /wp-json/historic-equity/v1/projects/{id}`

### Path Parameters

```
id: integer - WordPress post ID of the project
```

### Response Schema

#### Success Response (200 OK)
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "const": true
    },
    "project": {
      "type": "object",
      "description": "Full project details (same schema as projects array item plus additional fields)",
      "properties": {
        "seo_title": {
          "type": "string",
          "description": "Custom page title for SEO"
        },
        "seo_description": {
          "type": "string",
          "description": "Meta description for SEO"
        },
        "related_projects": {
          "type": "array",
          "items": {
            "type": "object",
            "description": "3-5 related projects based on state or property type"
          }
        }
      }
    }
  },
  "required": ["success", "project"]
}
```

#### Error Response (404 Not Found)
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
      "example": "Project not found"
    }
  },
  "required": ["success", "message"]
}
```

### Business Rules

1. **Visibility**: Only published projects are returned
2. **Image Optimization**: Return responsive image sizes for different display contexts
3. **Related Projects**: Suggest 3-5 similar projects based on state or property type
4. **SEO**: Include structured data markup for project showcases
5. **Performance**: Implement caching for frequently accessed project data

### Implementation Requirements

- WordPress REST API endpoint registration
- Custom query optimization for filtered results
- Image size generation for responsive display
- Caching layer for improved performance
- SEO metadata integration
- Related projects algorithm implementation