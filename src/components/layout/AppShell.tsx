import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import { Bell, CalendarDays, CreditCard, LayoutDashboard, Menu, Search, Settings, Users2 } from 'lucide-react';
import { useAuth } from '@/hooks';

const sidebarWidth = 292;

const navigationItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Members', href: '/members', icon: Users2 },
  { label: 'Seasons', href: '/seasons', icon: CalendarDays },
  { label: 'Contributions', href: '/contributions', icon: CreditCard },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface AppShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function AppShell({ title, subtitle, children, actions }: AppShellProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const sidebarContent = (
    <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            height: 52,
            width: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2f1d11 0%, #ea580c 52%, #fb923c 100%)',
            color: 'white',
            fontWeight: 800,
            boxShadow: '0 18px 40px -20px rgba(249,115,22,0.55)',
          }}
        >
          T
        </Box>
        <Box>
          <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.26em', color: 'text.secondary' }}>
            Tuimizane
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 14, fontWeight: 700 }}>Circle OS</Typography>
        </Box>
      </Box>

      <Paper
        sx={{
          mt: 3,
          borderRadius: '20px',
          p: 3,
          color: 'white',
          background: 'linear-gradient(160deg, #2f1d11 0%, #6b3411 55%, #c2410c 100%)',
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.72)' }}>
          Workspace focus
        </Typography>
        <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 800 }}>
          Sticky operations layout
        </Typography>
        <Typography sx={{ mt: 1.5, fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)' }}>
          Navigate between members, seasons, and contributions without losing context while scrolling.
        </Typography>
      </Paper>

      <List sx={{ mt: 2.5, display: 'grid', gap: 1.25, px: 0 }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = router.pathname === item.href;

          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton selected={active}>
                <ListItemIcon sx={{ minWidth: 40, color: active ? 'primary.main' : 'text.secondary' }}>
                  <Icon size={18} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: 14, fontWeight: 700 }}>{item.label}</Typography>} />
              </ListItemButton>
            </Link>
          );
        })}
      </List>

      <Paper sx={{ mt: 3.5, borderRadius: '18px', p: 3, bgcolor: 'background.warm' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Signed in as</Typography>
        <Typography sx={{ mt: 1.25, fontSize: 16, fontWeight: 800 }}>{user?.username || 'User'}</Typography>
        <Typography sx={{ mt: 0.75, fontSize: 13, color: 'text.secondary' }}>
          Operations lead
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <Box className="relative min-h-screen overflow-hidden">
      <Box className="absolute inset-0 -z-10">
        <Box className="absolute left-[-5%] top-[8%] h-72 w-72 rounded-full bg-primary-200/55 blur-3xl" />
        <Box className="absolute right-[-6%] top-[4%] h-80 w-80 rounded-full bg-accent-200/45 blur-3xl" />
        <Box className="absolute bottom-[-10%] left-[22%] h-80 w-80 rounded-full bg-amber-100/50 blur-3xl" />
        <Box className="absolute inset-0 bg-hero-grid bg-[size:42px_42px] opacity-[0.04]" />
      </Box>

      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, background: 'transparent', boxShadow: 'none' }}
      >
        <Paper sx={{ borderRadius: '20px' }}>
          <Toolbar sx={{ minHeight: 88, gap: 2.5, px: { xs: 2.5, sm: 3 } }}>
            <IconButton
              color="inherit"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { lg: 'none' }, bgcolor: 'background.soft' }}
            >
              <Menu size={20} />
            </IconButton>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'text.secondary' }}>
                {subtitle}
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.5 }}>
                {title}
              </Typography>
            </Box>

            <Paper
              sx={{
                display: { xs: 'none', md: 'flex' },
                width: { sm: 280, lg: 360 },
                alignItems: 'center',
                gap: 1.5,
                px: 2.25,
                py: 1.5,
                borderRadius: '16px',
                boxShadow: 'none',
                bgcolor: 'background.warm',
              }}
            >
              <Search size={16} />
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                Search members, seasons, and records
              </Typography>
            </Paper>

            {actions}

            <IconButton sx={{ bgcolor: 'background.soft' }}>
              <Bell size={18} />
            </IconButton>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', bgcolor: '#2f1d11', color: 'white', px: 1.75, py: 1.1, borderRadius: '16px' }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.12)' }}>
                {(user?.username?.[0] || 'U').toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{user?.username || 'User'}</Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Admin workspace</Typography>
              </Box>
            </Box>
          </Toolbar>
        </Paper>
      </AppBar>

      <Box sx={{ display: 'flex', px: { xs: 2, sm: 3 }, pb: 3, gap: 2.5 }}>
        <Paper
          sx={{
            display: { xs: 'none', lg: 'block' },
            width: sidebarWidth,
            flexShrink: 0,
            borderRadius: '24px',
            height: 'calc(100vh - 120px)',
            position: 'sticky',
            top: 108,
            overflow: 'auto',
          }}
        >
          {sidebarContent}
        </Paper>

        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { lg: 'none' } }}>
          <Box sx={{ width: 320, p: 1 }}>{sidebarContent}</Box>
        </Drawer>

        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
