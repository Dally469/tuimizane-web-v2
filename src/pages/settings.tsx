import React from 'react';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrganization } from '@/hooks';

export default function SettingsPage() {
  const { organization, getCurrentOrganization, updateOrganization, isLoading, error } = useOrganization();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    getCurrentOrganization();
  }, [getCurrentOrganization]);

  React.useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        email: organization.email || '',
        phone: organization.phone || '',
        address: organization.address || '',
      });
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    const response = await updateOrganization(organization.id, formData);
    if (response) {
      setSuccessMessage('Organization settings updated successfully.');
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Workspace preferences">
      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', xl: 'minmax(0,1fr) 320px' } }}>
        <Paper sx={{ borderRadius: '24px', p: 3.5 }}>
          <Typography variant="h4">Organization settings</Typography>
          <Typography sx={{ mt: 1.25, maxWidth: 720, fontSize: 14, lineHeight: 1.9, color: 'text.secondary' }}>
            Update the organization profile that appears across the platform and keep your workspace information current.
          </Typography>

          {error && <Alert severity="error" sx={{ mt: 2.5 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mt: 2.5 }}>{successMessage}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'grid', gap: 2 }}>
            <TextField
              label="Organization name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />

            <Button type="submit" variant="contained" disabled={isLoading || !organization?.id}>
              {isLoading ? 'Saving...' : 'Save settings'}
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ borderRadius: '24px', p: 3.5, alignSelf: 'start', position: { xl: 'sticky' }, top: { xl: 108 } }}>
          <Typography variant="h6">Workspace notes</Typography>
          <Typography sx={{ mt: 1.5, fontSize: 14, lineHeight: 1.9, color: 'text.secondary' }}>
            These settings power the organization identity shown throughout your sticky app layout.
          </Typography>

          <Box sx={{ mt: 2.5, display: 'grid', gap: 1.5 }}>
            {[
              ['Primary theme', 'Orange palette is applied app-wide.'],
              ['Navigation', 'Sidebar and top bar stay visible while scrolling.'],
              ['Forms', 'Members and seasons use the existing form components in dialogs.'],
            ].map(([label, value]) => (
              <Paper key={label} sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 800 }}>{label}</Typography>
                <Typography sx={{ mt: 0.75, fontSize: 13, color: 'text.secondary' }}>{value}</Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
