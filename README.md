# Professional Portfolio - Angular 21

A modern, professional portfolio application built with Angular 21, Bootstrap 5, and TypeScript. This application showcases professional experience, projects, achievements, skills, and more in a clean, responsive interface.

## Features

- ✅ **Profile Overview** - Comprehensive professional profile with avatar and summary
- 📊 **Work Experience** - Detailed work history with accordion interface
- 🚀 **Projects Showcase** - Portfolio of completed projects with links
- 🏆 **Achievements** - Awards, certifications, and recognitions
- 📚 **Courses & Training** - Professional development and continuous learning
- 👥 **Management Experience** - High-level and operational management responsibilities
- 💻 **Skills & Expertise** - Technical skills with proficiency levels
- ⏱️ **Career Timeline** - Chronological view of career milestones
- 📧 **Contact Page** - Multiple contact methods (WhatsApp, Email, LinkedIn)
- 📄 **PDF Export** - Export profile to PDF document

## Technology Stack

- **Angular** 21.0.6
- **Bootstrap** 5 (via npm)
- **TypeScript** 5.9.2
- **SCSS** for styling
- **Signals** for reactive state management
- **Standalone Components** (no NgModules)
- **OnPush Change Detection** for performance
- **jsPDF & html2canvas** for PDF export

## Architecture

### Folder Structure

```
src/app/
├── core/
│   ├── models/           # TypeScript interfaces and models
│   │   ├── profile.model.ts
│   │   ├── experience.model.ts
│   │   ├── project.model.ts
│   │   ├── achievement.model.ts
│   │   ├── course.model.ts
│   │   ├── management.model.ts
│   │   ├── skill.model.ts
│   │   ├── timeline.model.ts
│   │   └── contact.model.ts
│   └── services/         # Core services
│       ├── config-data.service.ts    # Data loading with signals
│       └── pdf-export.service.ts     # PDF generation
├── features/             # Feature modules (lazy loaded)
│   ├── profile/
│   ├── experience/
│   ├── projects/
│   ├── achievements/
│   ├── courses/
│   ├── management/
│   ├── skills/
│   ├── timeline/
│   └── contact/
├── shared/              # Shared components
│   └── components/
│       ├── section-header/
│       ├── card/
│       ├── badge/
│       └── timeline-item/
├── app.component.*      # Root component with navigation
├── app.routes.ts        # Route configuration
└── app.config.ts        # Application configuration
```

### Data Layer

All data is loaded from JSON files located in `public/assets/config/`:
- `profile.json` - Personal profile information
- `experience.json` - Work experience details
- `projects.json` - Project portfolio
- `achievements.json` - Awards and certifications
- `courses.json` - Training and courses
- `management.json` - Management responsibilities
- `skills.json` - Technical skills and proficiency
- `timeline.json` - Career timeline events
- `contact.json` - Contact information and social links

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd myProfile
```

2. Install dependencies:
```bash
npm install
```

3. Customize your data:
   - Edit JSON files in `public/assets/config/` with your information
   - Replace avatar image at `public/assets/images/avatar.jpg`
   - Update project images in `public/assets/images/projects/`

### Development Server

Run the development server:

```bash
npm start
```

Navigate to `http://localhost:4100`. The application will automatically reload when you make changes to the source files.

### Build

Build the project for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Testing

Run unit tests:

```bash
npm test
```

## Customization Guide

### Update Profile Data

1. **Personal Information**: Edit `public/assets/config/profile.json`
2. **Work Experience**: Update `public/assets/config/experience.json`
3. **Projects**: Modify `public/assets/config/projects.json`
4. **Skills**: Edit `public/assets/config/skills.json`
5. **Contact Info**: Update `public/assets/config/contact.json`

### Customize Styling

- **Global Styles**: Edit `src/styles.scss`
- **Theme Colors**: Modify CSS variables in `src/styles.scss` `:root` section
- **Component Styles**: Each component has its own `.scss` file

### Add New Routes

1. Create new component in `src/app/features/`
2. Add route to `src/app/app.routes.ts`
3. Add navigation item to `src/app/app.ts` navItems array

## Key Features

### Signals-First Architecture

All data is managed using Angular Signals for optimal performance:
```typescript
readonly profile = this.configService.profile;
```

### OnPush Change Detection

Every component uses OnPush strategy for better performance:
```typescript
changeDetection: ChangeDetectionStrategy.OnPush
```

### Lazy Loading

All feature routes are lazy loaded for optimal bundle size:
```typescript
{
  path: 'profile',
  loadComponent: () => import('./features/profile/profile.component')
}
```

### PDF Export

Export your profile to PDF with one click:
- Captures profile section including skills, experience, and achievements
- Uses html2canvas and jsPDF for high-quality output
- Handles multi-page documents automatically

## Component Standards

Every component follows these standards:
- ✅ Standalone component (no NgModules)
- ✅ OnPush change detection
- ✅ Signals for reactive state
- ✅ Fully typed inputs/outputs
- ✅ Separate HTML, SCSS, and spec files
- ✅ Smart/presentational separation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Features

- ✅ Lazy loading routes
- ✅ OnPush change detection
- ✅ Optimized bundle size
- ✅ Tree-shaking enabled
- ✅ Production builds optimized
- ✅ Signal-based reactivity

## License

This project is licensed under the MIT License.

## Author

Built with ❤️ using Angular 21

---

For questions or issues, please refer to the documentation or create an issue in the repository.
