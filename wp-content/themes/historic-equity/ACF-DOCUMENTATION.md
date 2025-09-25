# ACF Pro Implementation Documentation - Historic Equity WordPress Theme

## Overview

This document describes the Advanced Custom Fields (ACF) Pro implementation for the Historic Equity Inc. WordPress theme. All content is managed through ACF Pro field groups, providing a user-friendly content management experience.

## Field Groups Implementation Status

### ✅ Homepage Content (`group_homepage_content`)
**Location**: Applied to the front page (homepage)
**Template**: `templates/index.twig`

**Fields Available:**
- **Hero Section**:
  - `hero_title` (Textarea) - Main headline
  - `hero_subtitle` (Textarea) - Supporting text
  - `hero_image` (Image) - Hero background image

- **Mission Section**:
  - `mission_title` (Text) - Section title
  - `mission_content` (Textarea) - Mission statement

- **Services Section**:
  - `services_title` (Text) - Section title
  - `service_items` (Repeater) - Service items with:
    - `title` (Text)
    - `content` (Textarea)
    - `image` (Image)

- **Success Stories Section**:
  - `stats_title` (Text) - Section title
  - `stats_subtitle` (Text) - Section subtitle
  - `stats_items` (Repeater) - Statistics with:
    - `number` (Text) - Statistic number
    - `label` (Text) - Statistic label

- **Why Partner Section**:
  - `partner_title` (Text) - Section title
  - `partner_items` (Repeater) - Benefits with:
    - `title` (Text)
    - `description` (Textarea)
    - `icon` (Select) - Icon choice

- **CTA Section**:
  - `cta_title` (Text) - CTA title
  - `cta_content` (Textarea) - CTA content
  - `cta_image` (Image) - CTA image
  - `cta_primary_button_text` (Text)
  - `cta_primary_button_link` (URL)
  - `cta_secondary_button_text` (Text)
  - `cta_secondary_button_link` (URL)

### ✅ Meet Our Team Content (`group_meet_our_team_content`)
**Location**: Applied to pages using `page-meet-our-team.php` template
**Template**: `templates/page-meet-our-team.twig`

**Fields Available:**
- **Hero Section**:
  - `team_hero_title` (Text)
  - `team_hero_content` (Textarea)

- **Team Section**:
  - `team_section_title` (Text)
  - `team_section_subtitle` (Text)
  - `team_members` (Repeater) - Team member entries with:
    - `name` (Text) - Member name
    - `title` (Text) - Job title
    - `bio` (Textarea) - Member biography
    - `photo` (Image) - Profile photo
    - `social_links` (Repeater) - Social media links:
      - `platform` (Select) - LinkedIn, Twitter, Email
      - `url` (URL) - Link URL

- **Team CTA Section**:
  - `team_cta_title` (Text)
  - `team_cta_content` (Textarea)
  - `team_cta_image` (Image)

### ✅ Contact Page Content (`group_contact_page_content`)
**Location**: Applied to pages using `page-contact.php` template
**Template**: `templates/page-contact.twig`

**Fields Available:**
- **Hero Section**:
  - `contact_hero_title` (Text)
  - `contact_hero_content` (Textarea)

- **Contact Information**:
  - `contact_title` (Text) - Contact section title
  - `email` (Email) - Contact email
  - `phone` (Text) - Contact phone
  - `office_address` (Textarea) - Office address
  - `contact_description` (Textarea) - Contact description

- **Form Section**:
  - `form_title` (Text) - Form section title
  - `form_description` (Textarea) - Form description
  - `gravity_form_id` (Number) - Gravity Form ID (default: 1)

### ✅ Global Content (`group_global_content`)
**Location**: ACF Options page (`Theme Settings`)
**Usage**: Available globally across all templates

**Fields Available:**
- **Header Fields**:
  - `site_logo` (Image) - Main site logo
  - `navigation_cta_text` (Text) - Header CTA button text
  - `navigation_cta_link` (URL) - Header CTA button link

- **Footer Fields**:
  - `footer_logo` (Image) - Footer logo
  - `footer_tagline` (Text) - Footer tagline
  - `footer_contact_info` (Textarea) - Footer contact info
  - `footer_social_links` (Repeater) - Social media links:
    - `platform` (Select) - Facebook, Instagram, Twitter, LinkedIn, YouTube
    - `url` (URL) - Social media URL

- **Brand Colors**:
  - `primary_orange` (Color Picker) - #BD572B
  - `primary_gold` (Color Picker) - #E6CD41
  - `primary_brown` (Color Picker) - #95816E
  - `light_blue` (Color Picker) - #83ACD1
  - `navy` (Color Picker) - #2D2E3D

- **Company Information**:
  - `company_name` (Text) - Historic Equity Inc.
  - `founded_year` (Number) - 2001
  - `headquarters_address` (Textarea) - St. Louis, MO

### ✅ Generic Page Content (`group_generic_page_content`)
**Location**: Applied to all other pages (excluding homepage, contact, team)
**Template**: `templates/page-generic.twig`

**Fields Available:**
- **Hero Section**:
  - `page_hero_title` (Text)
  - `page_hero_subtitle` (Textarea)
  - `page_hero_image` (Image)

- **Main Content**:
  - `page_main_content` (WYSIWYG) - Rich text editor

- **Flexible Content Sections**:
  - `page_content_sections` (Flexible Content) with layouts:
    - **Text Section**: `section_title`, `section_content`
    - **Image + Text Section**: `section_title`, `section_content`, `section_image`, `layout`
    - **Call to Action**: `cta_title`, `cta_content`, `button_text`, `button_link`

- **SEO Fields**:
  - `page_seo_title` (Text) - Custom SEO title
  - `page_seo_description` (Textarea) - Meta description

## Gravity Forms Integration

### Form ID Configuration
The contact page integrates with Gravity Forms using the `gravity_form_id` ACF field:

- **Default Form ID**: 1 (as specified by user)
- **Fallback Logic**: If ACF field is empty, form ID "1" is used
- **Shortcode**: `[gravityform id="1" title="false" description="false" ajax="true"]`

### Form Styling
Custom CSS is applied to match the TailwindCSS design system:
- Form fields styled with proper padding, borders, and focus states
- Submit button uses Historic Equity brand colors
- Responsive design for all devices

## WordPress Admin Access

### ACF Options Page
Access global content settings via:
**WordPress Admin → Theme Settings**

### Page-Specific Fields
Edit content for specific pages:
1. **Homepage**: Edit the page set as "Front Page" in Settings → Reading
2. **Team Page**: Create/edit a page and assign the "Meet Our Team" template
3. **Contact Page**: Create/edit a page and assign the "Contact" template
4. **Other Pages**: All other pages will use Generic Page Content fields

### Field Group Locations
Field groups are automatically applied based on:
- **Homepage**: Front page setting
- **Team Page**: `page-meet-our-team.php` template
- **Contact Page**: `page-contact.php` template
- **Global Content**: ACF Options page
- **Generic Pages**: All other pages (excluding the above)

## Content Management Workflow

### 1. Homepage Content
1. Go to **Pages → Edit Homepage** (front page)
2. Scroll down to "Homepage Content" fields
3. Fill in hero, mission, services, stats, partner benefits, and CTA sections
4. Use repeater fields for services, stats, and partner benefits
5. Upload images for hero and CTA sections

### 2. Team Management
1. Create a page and assign "Meet Our Team" template
2. Fill in team hero section
3. Use "Team Members" repeater to add each team member:
   - Add name, title, bio
   - Upload profile photo
   - Add social media links (LinkedIn, Twitter, Email)

### 3. Contact Information
1. Create a page and assign "Contact" template
2. Configure contact information (email, phone, address)
3. Set Gravity Form ID (default: 1)
4. Customize form section titles and descriptions

### 4. Global Settings
1. Go to **Theme Settings** in WordPress admin
2. Upload site logo and footer logo
3. Configure navigation CTA button
4. Set up footer contact information and social links
5. Adjust brand colors if needed
6. Update company information

### 5. Additional Pages
1. Create new pages normally
2. Use flexible content sections to build custom layouts:
   - Text sections for content blocks
   - Image + Text sections for alternating layouts
   - Call to Action sections for conversion points

## Technical Implementation

### Field Loading
Fields are loaded into Timber context via `functions.php`:
```php
// Load ACF fields for current post/page
if (function_exists('get_fields')) {
    global $post;
    if ($post) {
        $context['fields'] = get_fields($post->ID);
    }
    // Load global ACF fields (stored in options)
    $context['global_fields'] = get_fields('option');
}
```

### Template Usage
Templates access fields using Twig syntax:
```twig
{{ fields.hero_title|default('Default Title') }}
{{ global_fields.company_name|default('Historic Equity Inc.') }}
```

### Fallback Content
All fields have default values to ensure the site functions properly even without content added to ACF fields.

## Troubleshooting

### Common Issues

1. **Fields not appearing in admin**:
   - Ensure ACF Pro plugin is activated
   - Check that `/lib/acf-field-groups.php` is being loaded
   - Verify field group location rules

2. **Content not displaying on frontend**:
   - Check that fields are filled in WordPress admin
   - Verify template is using correct field names
   - Ensure ACF fields are loaded in Timber context

3. **Gravity Form not displaying**:
   - Verify Gravity Forms plugin is activated
   - Check that form ID "1" exists in Gravity Forms
   - Ensure form ID is set correctly in ACF field

### Debug Information
If issues occur, check:
- WordPress admin → Tools → Site Health
- ACF Pro plugin version and activation status
- Gravity Forms plugin version and activation status
- Theme template files for correct field syntax

## Maintenance Notes

- Field groups are defined programmatically in `/lib/acf-field-groups.php`
- Default values are set for all fields to provide fallback content
- All fields support the Historic Equity brand and design system
- Regular backups recommended before making changes to field groups
- Test all changes in staging environment before deploying to production

---

**Last Updated**: September 2025
**ACF Pro Version**: Compatible with 6.0+
**Gravity Forms**: Compatible with 2.5+
**WordPress**: Compatible with 6.8.2+