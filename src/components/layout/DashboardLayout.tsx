// DashboardLayout.tsx
import React, { useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import {
  AppBar, Toolbar, IconButton, Typography, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Avatar, Divider, Badge,
} from '@mui/material';
import {
  Menu as MenuIcon, LayoutDashboard, Users2, CreditCard,
  CalendarDays, Settings, LogOut, ChevronRight,
  Bell,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';

const drawerWidth = 260;

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const navigationItems = [
  { text: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
  { text: 'Members', icon: <Users2 size={18} />, path: '/members' },
  { text: 'Contributions', icon: <CreditCard size={18} />, path: '/contributions' },
  { text: 'Seasons', icon: <CalendarDays size={18} />, path: '/seasons' },
  { text: 'Settings', icon: <Settings size={18} />, path: '/settings' },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children, title, subtitle,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = useCallback(() => {
    dispatch(logout());
    setLogoutDialogOpen(false);
    router.push('/login');
  }, [dispatch, router]);
  const handleNavigation = useCallback((path: string) => {
    router.push(path);
    setMobileOpen(false);
  }, [router]);

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#faf8f5',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.2,
        px: 2.25, py: 1.75,
        borderBottom: '1px solid rgba(15,23,42,0.08)',
      }}>
        <Box
          component="img"
          src="/assets/logo_login.png"
          alt="Tuimizane logo"
          sx={{
            width: 58,
            height: 58,
            borderRadius: '10px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
          }}
        />
        <Box>
          <Typography sx={{
            fontSize: 15, fontWeight: 700,
            color: '#1f2937', letterSpacing: '-0.01em',
          }}>
            Tuimizane
          </Typography>
          <Typography sx={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>
            Portal
          </Typography>
        </Box>
      </Box>

      {/* Nav */}
      <List sx={{ px: 1, flex: 1, pt: 2 }}>
        {navigationItems.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '10px',
                  px: 1.5, py: 1,
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.12), rgba(251, 146, 60, 0.08))'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(234, 88, 12, 0.2)' : '1px solid transparent',
                  '&::before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3.5, height: 20,
                    background: '#ea580c',
                    borderRadius: '0 3px 3px 0',
                  } : {},
                  '&:hover': {
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.12), rgba(251, 146, 60, 0.08))'
                      : 'rgba(0,0,0,0.04)',
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 38,
                  color: isActive ? '#ea580c' : '#6b7280',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: 13.5,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#1f2937' : '#4b5563',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User footer */}
      <Divider sx={{ borderColor: 'rgba(15,23,42,0.08)' }} />
      {/* <Box sx={{ p: 1, pb: 1.5 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.2,
          px: 1.5, py: 1, borderRadius: '10px',
          transition: 'background 0.2s',
          '&:hover': { background: 'rgba(0,0,0,0.05)' },
        }}>
          <Avatar sx={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
            fontSize: 13, fontWeight: 600, color: 'white',
          }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1f2937', lineHeight: 1.3 }}>
              {user?.username}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>Admin</Typography>
          </Box>
          <ChevronRight size={16} color="#d1d5db" />
        </Box>
      </Box> */}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#faf8f5' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: '#ffffff',
          borderBottom: '1px solid rgba(15,23,42,0.08)',
          color: 'inherit',
        }}
      >
        <Toolbar sx={{ minHeight: '80px !important', px: { xs: 2, sm: 3 } }}>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: '#1a1714' }}
          >
            <MenuIcon size={20} />
          </IconButton>
          {/* Header */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '10px', background: '#f3f4f6' }}>
              {title === 'Dashboard' && <LayoutDashboard size={20} color="#ea580c" />}
              {title === 'Members' && <Users2 size={20} color="#ea580c" />}
              {title === 'Contributions' && <CreditCard size={20} color="#ea580c" />}
              {title === 'Seasons' && <CalendarDays size={20} color="#ea580c" />}
              {title === 'Settings' && <Settings size={20} color="#ea580c" />}
            </Box>
            <Box>
              <Typography sx={{
                fontSize: 20, fontWeight: 800, color: '#1f2937',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography sx={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.2, fontWeight: 500 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" sx={{
              border: '1px solid rgba(15,23,42,0.08)',
              borderRadius: '8px', width: 36, height: 36,
              color: '#6b7280',
              transition: 'all 0.2s',
              '&:hover': {
                background: '#f3f4f6',
              },
            }}>
              <Badge
                variant="dot"
                sx={{ '& .MuiBadge-dot': { background: '#ea580c', width: 6, height: 6, top: -4, right: -4 } }}
              >
                <Bell size={16} />
              </Badge>
            </IconButton>
            {user && (
              <>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1.2,
                  px: 1.5, py: 0.75, borderRadius: '10px',
                  background: '#f9fafb', border: '1px solid rgba(15,23,42,0.08)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: '#f3f4f6', borderColor: 'rgba(15,23,42,0.12)',
                  },
                }}>
                  <Avatar sx={{
                    width: 32, height: 32,
                    background: 'linear-gradient(135deg, #ea580c, #fb923c)',
                    fontSize: 12, fontWeight: 600, color: 'white',
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#1f2937', lineHeight: 1.2 }}>
                      {user.username}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>Admin</Typography>
                  </Box>
                  <IconButton
                    onClick={() => setLogoutDialogOpen(true)}
                    size="small"
                    sx={{
                      width: 28, height: 28, ml: 0.5,
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.08)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: 'rgba(239, 68, 68, 0.16)',
                        color: '#dc2626',
                      },
                    }}
                  >
                    <LogOut size={14} />
                  </IconButton>
                </Box>
                {/* Logout Confirmation Dialog */}
                <Dialog
                  open={logoutDialogOpen}
                  onClose={() => setLogoutDialogOpen(false)}
                  slotProps={{
                    paper: {
                      sx: {
                        borderRadius: '14px',
                        minWidth: 360,
                      },
                    },
                  }}
                >
                  <DialogTitle sx={{ fontSize: 18, fontWeight: 700, pb: 1 }}>
                    Sign out?
                  </DialogTitle>
                  <DialogContent sx={{ pb: 1 }}>
                    <Typography sx={{ fontSize: 14, color: '#6b7280', mt: 0.5 }}>
                      You'll be logged out of your account. You can sign back in anytime.
                    </Typography>
                  </DialogContent>
                  <DialogActions sx={{ gap: 1, p: 2, pt: 0 }}>
                    <Button
                      onClick={() => setLogoutDialogOpen(false)}
                      variant="outlined"
                      sx={{ borderColor: '#e5e7eb', color: '#374151' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="contained"
                      sx={{ background: '#ef4444', '&:hover': { background: '#dc2626' } }}
                    >
                      Sign out
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, border: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important' }} />
        <Box sx={{ p: { xs: 2, sm: 3 }, my: 2  }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};