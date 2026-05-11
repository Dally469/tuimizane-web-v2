import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowRight, BarChart3, CalendarDays, ShieldCheck, Wallet } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/authSlice';
import { LoginRequest } from '@/types/api';
import { authService } from '@/services';

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });

  const contributionMetrics = [
    { label: 'Collected this week', value: '82%', width: '82%', delay: '0.1s' },
    { label: 'Member contribution rate', value: '91%', width: '91%', delay: '0.2s' },
    { label: 'Pending follow-ups', value: '24%', width: '24%', delay: '0.3s' },
  ];

  const seasonPayouts = [
    { label: 'Week 1', amount: 'USD 240,000', status: 'done' },
    { label: 'Week 2', amount: 'USD 240,000', status: 'done' },
    { label: 'Week 3', amount: 'USD 240,000', status: 'active' },
    { label: 'Week 4', amount: 'USD 240,000', status: 'next' },
  ] as const;

  const canSubmit = Boolean(formData.username && formData.password) && !isLoading;

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const response = await authService.login(formData);
      
      if (response.success && response.data) {
        const userData = response.data;
        dispatch(loginSuccess({
          user: {
            id: userData.id,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            organizationId: userData.organization?.id || '',
          },
          token: response.token!,
        }));
        router.push('/dashboard');
      } else {
        dispatch(loginFailure(response.message || 'Login failed'));
      }
    } catch (err: any) {
      dispatch(loginFailure(err.message || 'Login failed'));
    }
  };

  return (
    <Box className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <Box className="absolute inset-0 -z-10">
        <Box className="absolute left-[-8%] top-12 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        <Box className="absolute right-[-8%] top-0 h-80 w-80 rounded-full bg-yellow-100/70 blur-3xl" />
        <Box className="absolute inset-0 bg-hero-grid bg-size-[38px_38px] opacity-[0.04]" />
      </Box>

      <Box className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-6 lg:grid-cols-[1fr_0.88fr] lg:gap-10">
        <Box>
          <Box sx={{ maxWidth: 640 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'text.secondary' }}>
              Tuimizane insights
            </Typography>
            <Typography variant="h1" sx={{ mt: 2, fontSize: { xs: 34, sm: 44, lg: 52 }, lineHeight: 1.08 }}>
              Contribution metrics and season payout, in one clear view.
            </Typography>
            <Typography sx={{ mt: 2.5, maxWidth: 560, fontSize: 16, lineHeight: 1.8, color: 'text.secondary' }}>
              Minimal by design, but still informative. Follow contribution momentum and payout status before entering the dashboard.
            </Typography>

            <Box className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card
                sx={{
                  borderRadius: '18px',
                  bgcolor: 'rgba(255,255,255,0.84)',
                  border: '1px solid',
                  borderColor: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 16px 35px -24px rgba(15,23,42,0.35)',
                  '@keyframes fillTrack': {
                    from: { width: 0 },
                    to: { width: 'var(--target-width)' },
                  },
                }}
              >
                <CardContent sx={{ p: 3.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                    <BarChart3 size={16} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Contribution metrics</Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gap: 1.6 }}>
                    {contributionMetrics.map((metric) => (
                      <Box key={metric.label}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{metric.label}</Typography>
                          <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{metric.value}</Typography>
                        </Box>
                        <Box sx={{ height: 8, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.18)', overflow: 'hidden' }}>
                          <Box
                            sx={{
                              '--target-width': metric.width,
                              height: '100%',
                              borderRadius: 999,
                              background: 'linear-gradient(90deg, #00466e 0%, #1e6f96 72%, #f2a900 100%)',
                              animationName: 'fillTrack',
                              animationDuration: '1.1s',
                              animationDelay: metric.delay,
                              animationFillMode: 'both',
                              animationTimingFunction: 'ease-out',
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: '18px',
                  background: 'linear-gradient(160deg, #062b3d 0%, #00466e 58%, #1e6f96 100%)',
                  color: 'white',
                  '@keyframes pulseDot': {
                    '0%': { transform: 'scale(1)', opacity: 0.9 },
                    '70%': { transform: 'scale(1.65)', opacity: 0 },
                    '100%': { transform: 'scale(1.65)', opacity: 0 },
                  },
                }}
              >
                <CardContent sx={{ p: 3.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                    <CalendarDays size={16} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.86)' }}>Season payout</Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gap: 1.25 }}>
                    {seasonPayouts.map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderRadius: '10px',
                          px: 1.2,
                          py: 1,
                          bgcolor: item.status === 'active' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ position: 'relative', width: 10, height: 10 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: item.status === 'done' ? '#f2a900' : item.status === 'active' ? '#fde68a' : 'rgba(255,255,255,0.42)',
                              }}
                            />
                            {item.status === 'active' && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  borderRadius: '50%',
                                  border: '2px solid #fde68a',
                                  animation: 'pulseDot 1.8s infinite',
                                }}
                              />
                            )}
                          </Box>
                          <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{item.label}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{item.amount}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        <Box className="mx-auto w-full max-w-xl">
          <Card
            sx={{
              borderRadius: '22px',
              bgcolor: 'rgba(255,255,255,0.9)',
              border: '1px solid',
              borderColor: 'rgba(255,255,255,0.95)',
              boxShadow: '0 24px 40px -30px rgba(15,23,42,0.45)',
            }}
          >
            <CardContent sx={{ p: { xs: 3.5, sm: 4.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box>
                  <Box
                    component="img"
                    src="/assets/logo_dashboard.png"
                    alt="Tuimizane logo"
                    sx={{
                      display: 'inline-flex',
                      // height: 152,
                      width: 202,
                      borderRadius: '12px',
                      // boxShadow: '0 16px 34px -24px rgba(249,115,22,0.55)',
                    }}
                  />
                  <Typography sx={{ mt: 3, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.28em', color: 'text.secondary' }}>
                    Tuimizane portal
                  </Typography>
                  <Typography variant="h2" sx={{ mt: 1.5, fontSize: { xs: 32, sm: 38 } }}>
                    Sign in
                  </Typography>
                  <Typography sx={{ mt: 1.2, fontSize: 14, lineHeight: 1.8, color: 'text.secondary' }}>
                    Secure login for members, contributions, and payout operations.
                  </Typography>
                </Box>

                <Chip
                  icon={<ShieldCheck size={15} />}
                  label="Secure access"
                  color="primary"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                />
              </Box>

              {/* <Box className="mt-7 grid gap-3 sm:grid-cols-2">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, borderRadius: '12px', bgcolor: 'background.warm', px: 2, py: 1.5 }}>
                  <BarChart3 size={16} />
                  <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>Live contribution context</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, borderRadius: '12px', bgcolor: 'background.warm', px: 2, py: 1.5 }}>
                  <Wallet size={16} />
                  <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>Season payout progress</Typography>
                </Box>
              </Box> */}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
                <Box sx={{ display: 'grid', gap: 2.5 }}>
                  <TextField
                    id="username"
                    label="Username or Email"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter your username or email"
                    helperText="This can be your username or registered email address."
                    fullWidth
                    autoFocus
                  />

                  <TextField
                    id="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    helperText="Passwords are case-sensitive."
                    fullWidth
                  />

                  {error && <Alert severity="error">{error}</Alert>}

                  <Box sx={{ py: 1, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                      <FormControlLabel
                        control={<Checkbox color="primary" />}
                        label="Keep this device signed in"
                      />
                      <Typography component="a" href="#" sx={{ fontSize: 14, fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}>
                        Forgot your password?
                      </Typography>
                    </Box>
                  </Box>

                  <Button type="submit" variant="contained" size="large" disabled={!canSubmit} endIcon={!isLoading ? <ArrowRight size={16} /> : null}>
                    {isLoading ? 'Signing in...' : 'Enter dashboard'}
                  </Button>

                  <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: '14px', bgcolor: 'background.warm', px: 2.5, py: 1.8, gap: 2 }}>
                    <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Need an account?</Typography>
                    <Typography component="a" href="#" sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', textDecoration: 'none' }}>
                      Contact your administrator
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
