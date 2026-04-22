# SDN-EDR Dashboard - Project Architecture

**Last Updated:** April 22, 2026  
**Version:** 1.0.0  
**Status:** Production Ready

---

## 1. Project Overview

The SDN-EDR Dashboard is a real-time cybersecurity monitoring system for Software-Defined Networks (SDN). It provides a comprehensive interface for threat detection, network topology visualization, OpenFlow management, and AI-driven security decisions.

### Key Characteristics

- **Frontend Framework:** React 19 + React Router 7
- **Build Tool:** Vite 8.0.8
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Charting:** Recharts for data visualization
- **HTTP Client:** Axios with JWT interceptors
- **Icons:** Lucide React
- **Responsive:** Mobile-first design with responsive grids

---

## 2. Directory Structure

```
src/
├── api/                          # API layer
│   ├── axios.js                  # Axios instance + JWT interceptor
│   ├── services.js              # Endpoint service methods (14 total)
│   └── mockData.js              # Centralized mock data generators
│
├── components/                   # React components
│   ├── ui/                       # Reusable UI primitives
│   │   ├── Card.jsx            # Card container with variants (base, cyan, red, green, amber)
│   │   ├── Badge.jsx           # Status badges with semantic colors
│   │   ├── Button.jsx          # Buttons with variants (primary, secondary, ghost)
│   │   ├── Input.jsx           # Form input with error states
│   │   ├── LivePulse.jsx       # Animated status indicator
│   │   └── index.js            # Component exports
│   │
│   └── layout/                  # Layout components
│       ├── MainLayout.jsx      # Root layout (Sidebar + TopBar + Outlet)
│       ├── Sidebar.jsx         # Navigation sidebar with logo
│       └── TopBar.jsx          # Header bar with status info
│
├── design-system/                # Design system (CENTRAL HUB)
│   ├── constants.js             # All design tokens 
│   │   ├── COLORS              # Color palette
│   │   ├── SPACING             # Spacing scale
│   │   ├── TYPOGRAPHY          # Font definitions
│   │   ├── SHADOWS             # Box shadows
│   │   ├── Z_INDEX             # Z-index scale
│   │   ├── BORDER_RADIUS       # Border radii
│   │   ├── ANIMATION           # Timing functions
│   │   ├── CARD_VARIANTS       # Card styles
│   │   └── STATUS_COLOR_MAP    # Status to color mapping
│   │
│   ├── hooks.js                 # Design system utilities
│   │   ├── useCardVariant()    # Get card variant styles
│   │   ├── useStatusColor()    # Get color for status
│   │   ├── useCardClass()      # Get card CSS class
│   │   ├── useResponsiveGrid() # Responsive grid classes
│   │   └── classNames()        # Merge class names
│   │
│   ├── index.js                 # Central export point
│   ├── ARCHITECTURE.md          # (document)
│   └── DESIGN_SYSTEM.md         # Design system documentation
│
├── hooks/                        # Custom React hooks
│   ├── useStatusPolling.js      # Poll status every 5s
│   └── useAuth.js              # Auth state management
│
├── lib/                          # Utilities
│   └── utils.js                # Helper functions (cn - merge classes)
│
├── pages/                        # Page components (5 modules + 2 special)
│   ├── Dashboard.jsx            # Module 1: Global Overview (KPIs, 24h chart)
│   ├── ThreatLogs.jsx          # Module 2: Threat Intelligence (attacks table)
│   ├── NetworkMap.jsx          # Module 3: Network Topology (SVG visualization)
│   ├── FlowInspector.jsx       # Module 4: Flow Inspector (OpenFlow rules)
│   ├── AIModelLab.jsx          # Module 5: AI Model Lab (xLSTM + PPO monitoring)
│   ├── Settings.jsx            # Settings page (placeholder)
│   └── Login.jsx               # Login page (auth stub)
│
├── App.jsx                       # Root app component with routes
├── main.jsx                      # Vite entry point
├── index.css                     # Global styles + custom Tailwind directives
└── ARCHITECTURE.md              # (you are here)
```

---

## 3. Design System Usage

### 3.1 Design System Tokens

All styling should FIRST check the design system constants:

```javascript
// ✅ CORRECT - Use design system
import { COLORS, SPACING, TYPOGRAPHY } from '../design-system/constants';

// Apply colors from design system
<div style={{ backgroundColor: COLORS.background.primary }}>
  <p style={{ color: COLORS.text.primary }}>Hello</p>
</div>
```

### 3.2 Tailwind Classes (Preferred)

Custom Tailwind colors defined in `tailwind.config.js`:

```javascript
// ✅ CORRECT - Use Tailwind custom colors
<div className="bg-primary text-secondary border border-cyan p-4">
  System text
</div>

// Color mapping in tailwind.config.js:
// primary: "#0A0E1A"         (background)
// card: "#151B2B"            (card bg)
// sidebar: "#0D1117"         (sidebar bg)
// cyan: "#00D9C0"            (accent)
// green: "#0A4A3F"           (success)
// red: "#E74C3C"             (danger)
// amber: "#F5A623"           (warning)
// secondary: "#9CA3AF"       (text)
// tertiary: "#6B7280"        (text)
// muted: "#A0AEC0"           (text)
// hint: "#475569"            (text)
// hover: "#1a2437"           (hover)
```

### 3.3 Design System Hooks

Custom hooks automate styling logic:

```javascript
// Get status-appropriate color automatically
import { useStatusColor } from '../design-system/hooks';

const color = useStatusColor('critical');  // Returns: { main, hex, bg, border, text }
// Result: { main: '#E74C3C', bg: 'rgba(231,76,60,0.08)', ... }

// Get responsive grid classes
const gridClass = useResponsiveGrid(4);  
// Returns: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```

### 3.4 Component Variants

All UI components support variants:

```javascript
// Card variants (base, cyan, green, red, amber)
<Card variant="cyan" />

// Badge variants - matches Card variants
<Badge variant="danger" />    // red variant
<Badge variant="success" />   // green variant

// Button variants (primary, secondary, ghost)
<Button variant="secondary" size="lg" />

// Input with error state
<Input error={hasError} />
```

---

## 4. API Layer Architecture

### 4.1 Service Methods (14 total)

```javascript
// Metrics API
getDashboardMetrics()                    // Current KPIs
getMetricsHistory(hours, resolution)     // Chart data

// Attacks API
getAttacks(limit, offset, timerange)     // Attack list
getAttack(attackId)                      // single attack details
getAttackSummary()                       // Stats summary

// Topology API
getTopology()                            // Network switches + links

// Flows API
getFlows(dpid, limit, offset)            // OpenFlow rules
getFlowStatistics()                      // Flow stats

// Models API  
getModels()                              // xLSTM + PPO models
predictRisk(features, flowKey)           // Risk prediction
decideAction(netFeatures, riskProbs, flowKey)  // RL decision

// Legacy API
getStatus()                              // System status
getLogs(params)                          // Security logs
getFilteredLogs(filters)                 // Filtered logs
postLog(data)                            // Submit log

// Mock Data (Centralized)
generateMockAttacks()                    // Mock attack data
generateMockFlows()                      // Mock flow data
generateLatencyHistory()                 // Mock latency chart
generateRewardHistory()                  // Mock reward chart
```

### 4.2 Error Handling Pattern

All services include try/catch + mock data fallback:

```javascript
try {
  const response = await getAttacks();
  setData(response.data);
} catch (err) {
  console.error('Error:', err);
  // Fallback to mock data
  setData(generateMockAttacks());
}
```

### 4.3 JWT Authentication

Axios interceptor automatically includes JWT token:

```javascript
// In src/api/axios.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sdn_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 5. Component Documentation

### 5.1 Dashboard.jsx (Module 1 - Global Overview)

**Purpose:** Display high-level KPIs and 24-hour performance trends

**Route:** `/` or `/dashboard`

**Features:**
- 4 KPI status cards (Network, Security, AI, System)
- 24-hour AreaChart showing packets/sec + MB/s
- 3 summary stat cards below

**Data Flow:**
```
getDashboardMetrics()  →  4 KPI cards
getMetricsHistory()    →  AreaChart
```

**Auto-refresh:** 30 seconds

---

### 5.2 ThreatLogs.jsx (Module 2 - Threat Intelligence)

**Purpose:** Monitor real-time attacks with details and filtering

**Route:** `/threats`

**Features:**
- Summary cards (total attacks, blocked, success rate, response time)
- Searchable attacks table with 15+ columns
- Expandable rows showing anomaly + AI analysis
- Severity filtering + search

**Data Flow:**
```
getAttacks()       →  Attack table
getAttackSummary() →  Summary cards
```

**Auto-refresh:** 60 seconds

**Filtering:**
- By severity (critical, high, medium, low)
- By source/destination IP
- By attack type

---

### 5.3 NetworkMap.jsx (Module 3 - Network Topology)

**Purpose:** Visualize SDN topology with interactive switches

**Route:** `/network` or `/topology`

**Features:**
- SVG-based switch visualization
- Clickable switches with selection
- Links showing bandwidth + latency
- Detail sidebar for selected switch

**Data Flow:**
```
getTopology()  →  SVG + detail panel
```

**Auto-refresh:** 30 seconds

---

### 5.4 FlowInspector.jsx (Module 4 - Flow Inspector)

**Purpose:** Manage and monitor OpenFlow rules

**Route:** `/flows`

**Features:**
- 3 statistics cards (active flows, avg packets, active meters)
- Searchable flows table
- DPID filtering
- Expandable rows with match criteria + actions

**Data Flow:**
```
getFlows()           →  Flow table
getFlowStatistics()  →  Statistics cards
```

**Auto-refresh:** 60 seconds

---

### 5.5 AIModelLab.jsx (Module 5 - AI Model Lab)

**Purpose:** Monitor xLSTM risk model + PPO RL agent

**Route:** `/ai-lab`

**Features:**
- Split-panel layout (left: xLSTM, right: PPO)
- LineChart: decision latency over time
- BarChart: reward convergence
- Model comparison table

**Data Flow:**
```
getModels()  →  Model details + charts
```

**Auto-refresh:** 60 seconds

---

## 6. Styling Patterns

### 6.1 Color Usage Patterns

**Status Colors:**
- Critical/High → RED (#E74C3C)
- Medium/Warning → AMBER (#F5A623)
- Low/Success → GREEN (#0A4A3F)
- Info/Active → CYAN (#00D9C0)

**Usage:**
```jsx
// ✅ CORRECT
import { useStatusColor } from '../design-system/hooks';
const color = useStatusColor('critical');

// ✅ CORRECT
import { COLORS } from '../design-system/constants';
style={{ color: COLORS.status.danger }}

// ❌ WRONG
className="text-red-400"  // Hardcoded Tailwind
```

### 6.2 Card Spacing

All cards use consistent padding:

```jsx
// Standard card padding
<Card>
  <CardContent className="p-6">  {/* 24px padding */}
  </CardContent>
</Card>

// Top spacing between sections
<div className="space-y-6">  {/* 24px vertical gaps */}
</div>
```

### 6.3 Responsive Layout

Mobile-first breakpoints:

```jsx
// 1 column on mobile, 4 columns on desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

// 1 column on mobile, 3 on tablet, 4 on desktop
className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4"
```

---

## 7. Adding New Pages

### Step 1: Create page component

```javascript
// src/pages/NewModule.jsx
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useStatusColor } from '../design-system/hooks';

export default function NewModule() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">New Module</h1>
      <Card variant="cyan">
        <CardContent>Content here</CardContent>
      </Card>
    </div>
  );
}
```

### Step 2: Add route in App.jsx

```javascript
import NewModule from './pages/NewModule';

<Route element={<MainLayout />}>
  <Route path="/new-module" element={<NewModule />} />
</Route>
```

### Step 3: Add navigation in Sidebar.jsx

```javascript
{
  label: "New Module",
  icon: SomeIcon,
  path: "/new-module"
}
```

### Step 4: Test color scheme

- Use `useStatusColor()` for automatic colors
- Import `COLORS` for custom colors
- Never hardcode Tailwind colors

---

## 8. Testing Best Practices

### 8.1 Local Testing

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

### 8.2 Backend Integration

Ensure Flask backend implements all 8 critical endpoints:

- `GET /api/v1/metrics/dashboard`
- `GET /api/v1/metrics/history`
- `GET /api/v1/attacks`
- `GET /api/v1/attacks/summary`
- `GET /api/v1/topology`
- `GET /api/v1/flows`
- `GET /api/v1/flows/statistics`
- `GET /api/v1/models`

Backend must enable CORS for frontend origin.

---

## 9. Performance Considerations

### 9.1 Chart Optimization

- AreaChart limited to 24 data points (1 per hour)
- LineChart for AIModelLab uses 12 points max
- Recharts handles responsive sizing automatically

### 9.2 Auto-Refresh Intervals

- Dashboard: 30 seconds (high frequency due to performance metrics)
- Threats: 60 seconds (lower frequency to reduce API load)
- Topology: 30 seconds (switch state changes)
- Flows: 60 seconds (flow data is stable)
- AI Models: 60 seconds (model training is slow)

### 9.3 Bundle Size

Current build: ~720KB JS (gzip: 213KB)

Optimization strategies:
- Dynamic code splitting (if needed)
- Lazy load pages (if bundle grows)
- Tree-shake unused imports

---

## 10. Common Tasks

### Adding a new API endpoint

1. Add method to `src/api/services.js`
2. Add mock data generator to `src/api/mockData.js`
3. Use in page with try/catch + mock fallback

### Changing colors globally

1. Update `src/design-system/constants.js` COLORS object
2. All components automatically re-render (no manual updates needed)

### Adding a new badge variant

1. Extend CARD_VARIANTS in constants.js
2. Add mapping in STATUS_COLOR_MAP
3. Use in Badge component: `<Badge variant="newVariant" />`

### Making responsive changes

1. Add breakpoint to grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
2. Test mobile: DevTools device emulation
3. Test tablet: Resize browser to 768px
4. Test desktop: 1024px+

---

## 11. Troubleshooting

### Build fails with "module not found"

Check that all imports use correct paths relative to `src/`.

### Colors don't match design system

Verify you're using:
- Tailwind classes (preferred): `className="bg-primary text-cyan"`
- Or inline COLORS: `style={{ color: COLORS.status.danger }}`

Never mix Tailwind defaults with design system.

### API calls always fallback to mock

Check:
1. Backend running on `localhost:8000`
2. CORS enabled on backend
3. Endpoint path correct in services.js

### Charts not rendering

Check:
1. Data has correct format (see individual page documentation)
2. ResponsiveContainer has height set
3. Recharts library properly installed

---

## 12. References

- Design System: `src/design-system/`
- API Services: `src/api/services.js`
- Mock Data: `src/api/mockData.js`
- Component Examples: `src/components/ui/`
- Page Implementation: `src/pages/`

---

**End of Architecture Documentation**
