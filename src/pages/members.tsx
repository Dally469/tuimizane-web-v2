import React from 'react';
import { Tabs, Tab, Pagination } from '@mui/material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CreditCard,
  Edit3,
  Eye,
  FileUp,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserMinus,
  UserPlus,
  Users2,
  X,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MemberForm } from '@/components/members/MemberForm';
import { MemberDetailsDialog } from '@/components/members/MemberDetailsDialog';
import { useMembers } from '@/hooks';
import { formatCurrency, formatDate, formatMemberType, formatPhoneNumber } from '@/utils/format';
import { MEMBER_STATUS, MEMBER_TYPE, API_ENDPOINTS } from '@/utils/constants';
import type { MemberDTO } from '@/types/api';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
type TypeFilter = 'ALL' | number;

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export default function MembersPage() {
  const {
    members,
    fetchMembers,
    deleteMember,
    uploadMembers,
    isLoading,
    isUploading,
    uploadProgress,
    uploadResult,
    error,
  } = useMembers();

  const [query, setQuery] = React.useState('');
  // Tabbed status: 1 = Active, 0 = Inactive
  const [tabStatus, setTabStatus] = React.useState<number>(1); // Default to Active
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('ALL');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingMemberId, setEditingMemberId] = React.useState<string | null>(null);
  const [viewingMemberId, setViewingMemberId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<MemberDTO | null>(null);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [page, setPage] = React.useState(1); // 1-based for UI
  const [pageSize, setPageSize] = React.useState(21);
  const [totalPages, setTotalPages] = React.useState(1);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const safeMembers = Array.isArray(members) ? members : [];



  // Fetch paginated members (single source of truth)
  React.useEffect(() => {
    fetchMembers({
      page: page - 1,
      size: pageSize,
      setTotalPages,
    });
  }, [page, pageSize, fetchMembers]);

  // --- Derived data ---
  const activeCount = safeMembers.filter((m) => Number(m.status) === 1).length;
  const inactiveCount = safeMembers.filter((m) => Number(m.status) === 0).length;
  const totalContribution = safeMembers.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  const filteredMembers = safeMembers.filter((member) => {
    // Tabbed status filtering (Active/Inactive)
    if (tabStatus === 1 && Number(member.status) !== 1) return false;
    if (tabStatus === 0 && Number(member.status) !== 0) return false;
    // If typeFilter is 'ALL', show all Vision types for the status
    if (typeFilter !== 'ALL' && member.type !== typeFilter) return false;
    if (!query) return true;
    const term = query.toLowerCase();
    return (
      member.names.toLowerCase().includes(term) ||
      member.phone.toLowerCase().includes(term) ||
      member.idNumber.toLowerCase().includes(term)
    );
  });

  const editingMember = safeMembers.find((m) => m.id === editingMemberId);
  const viewingMember = safeMembers.find((m) => m.id === viewingMemberId) || null;

  // --- Handlers ---
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteMember(deleteTarget.id);
    if (ok) setDeleteTarget(null);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    const ok = await uploadMembers(uploadFile);
    if (ok) {
      setUploadFile(null);
      setIsUploadOpen(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
    e.target.value = '';
  };

  // --- Stat card helper ---
  const StatCard = ({
    label,
    value,
    color,
    icon,
  }: {
    label: string;
    value: string | number;
    color: string;
    icon: React.ReactNode;
  }) => (
    <Paper sx={{ borderRadius: '20px', p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'text.secondary',
            }}
          >
            {label}
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 800 }}>{value}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 42, height: 42 }}>{icon}</Avatar>
      </Box>
    </Paper>
  );

  return (
    <DashboardLayout title="Members" subtitle="Manage your people">
      <Box sx={{ display: 'grid', gap: 2.5 }}>
        {/* ---- Stat cards ---- */}
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
          }}
        >
          <StatCard
            label="Total members"
            value={safeMembers.length}
            color="primary.soft"
            icon={<Users2 size={20} />}
          />
          <StatCard
            label="Active"
            value={activeCount}
            color="success.main"
            icon={<UserCheck size={20} color="#fff" />}
          />
          <StatCard
            label="Inactive"
            value={inactiveCount}
            color="warning.main"
            icon={<UserMinus size={20} color="#fff" />}
          />
          <StatCard
            label="Total contributions"
            value={formatCurrency(totalContribution)}
            color="primary.main"
            icon={<CreditCard size={20} color="#fff" />}
          />
        </Box>

        {/* ---- Search + actions row ---- */}
        <Paper sx={{ borderRadius: '20px', p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, or ID..."
              size="small"
              sx={{ minWidth: 280, flex: 1, maxWidth: 420 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Upload size={16} />}
                onClick={() => setIsUploadOpen(true)}
              >
                Import
              </Button>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setIsCreateOpen(true)}
              >
                Add member
              </Button>
            </Stack>
          </Box>

          {/* Tabbed status filter */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Tabs
              value={tabStatus}
              onChange={(_e, v) => setTabStatus(v)}
              aria-label="Member status tabs"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                minHeight: 44,
                '& .MuiTab-root': { fontWeight: 800, fontSize: 15, minHeight: 44 },
              }}
            >
              <Tab
                label={`Active (${activeCount})`}
                value={1}
                sx={{ color: tabStatus === 1 ? 'success.main' : undefined }}
              />
              <Tab
                label={`Inactive (${inactiveCount})`}
                value={0}
                sx={{ color: tabStatus === 0 ? 'warning.main' : undefined }}
              />
            </Tabs>
          </Box>

          {/* Type filter chips */}
          {/* <Box sx={{ mb: 2, display: 'flex', gap: 1.5 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'text.secondary', mb: 0.75, alignSelf: 'center' }}>Type</Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              <Chip
                label={`All (${safeMembers.length})`}
                variant={typeFilter === 'ALL' ? 'filled' : 'outlined'}
                color="primary"
                onClick={() => setTypeFilter('ALL')}
                size="small"
                sx={{ fontWeight: 700 }}
              />
              {Object.entries(MEMBER_TYPE).map(([key, value]) => (
                <Chip
                  key={value}
                  label={`${formatMemberType(value)} (${safeMembers.filter((m) => m.type === value).length})`}
                  variant={typeFilter === value ? 'filled' : 'outlined'}
                  color="secondary"
                  onClick={() => setTypeFilter(value)}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
          </Box> */}
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {/* ---- Loading indicator ---- */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320, width: '100%' }}>
            <CircularProgress />
          </Box>
        )}

        {/* ---- Member cards grid ---- */}
        {!isLoading && filteredMembers.length > 0 && (
          <>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
                width: '100%',
                margin: 0,
                overflowX: 'hidden',
              }}
            >
              {filteredMembers.map((member) => (
                <Paper key={member.id} sx={{ borderRadius: '20px', p: 3, position: 'relative', minWidth: 0, overflow: 'hidden', width: '100%' }}>
                  {/* Top row: avatar + name + chips */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', minWidth: 0 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: Number(member.status) === 1 ? 'success.main' : 'warning.main',
                        fontSize: 16,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {initials(member.names)}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1.3 }} noWrap>
                        {member.names}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip
                          label={
                            Number(member.status) === 0 ? 'Inactive' :
                            Number(member.status) === 1 ? 'Active' :
                           
                            'Unknown'
                          }
                          size="small"
                          variant="outlined"
                          color={
                            Number(member.status) === 0 ? 'secondary' :
                            Number(member.status) === 1 ? 'success' :
                            'default'
                          }
                          sx={{ fontWeight: 700 }}
                        />
                        <Chip label={formatMemberType(member.type)} size="small" variant="outlined" />
                        {member.card && (
                          <Chip
                            icon={<CreditCard size={12} />}
                            label={member.card}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Stack>
                    </Box>
                  </Box>

                  {/* Contact info */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Phone size={14} color="#888" />
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        {formatPhoneNumber(member.phone)}
                      </Typography>
                    </Box>
                    {member.address && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <MapPin size={14} color="#888" />
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }} noWrap>
                          {member.address}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Contribution + Joined stats */}
                  <Box
                    sx={{
                      mt: 2,
                      display: 'grid',
                      gap: 1.5,
                      gridTemplateColumns: 'repeat(2, 1fr)',
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        bgcolor: 'primary.soft',
                        boxShadow: 'none',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.14em',
                          color: 'text.secondary',
                        }}
                      >
                        Contribution
                      </Typography>
                      <Typography sx={{ mt: 0.75, fontSize: 17, fontWeight: 800 }}>
                        {formatCurrency(member.amount, member.currency)}
                      </Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        bgcolor: 'background.warm',
                        boxShadow: 'none',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.14em',
                          color: 'text.secondary',
                        }}
                      >
                        Joined
                      </Typography>
                      <Typography sx={{ mt: 0.75, fontSize: 17, fontWeight: 800 }}>
                        {member.startDate ? formatDate(member.startDate) : 'Not set'}
                      </Typography>
                    </Paper>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Action buttons */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Eye size={14} />}
                      onClick={() => setViewingMemberId(member.id)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit3 size={14} />}
                      onClick={() => setEditingMemberId(member.id)}
                    >
                      Edit
                    </Button>
                    <Tooltip title="Delete member">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(member)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              ))}
            </Box>
            {/* Pagination controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_e, value) => setPage(value)}
                color="primary"
                shape="rounded"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        )}

        {/* ---- Empty state ---- */}
        {!isLoading && filteredMembers.length === 0 && (
          <Paper sx={{ borderRadius: '24px', p: 6, textAlign: 'center', bgcolor: 'background.warm', width: '100%', minWidth: 0, overflow: 'hidden' }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.soft',
                mx: 'auto',
              }}
            >
              <UserPlus size={26} />
            </Avatar>
            <Typography sx={{ mt: 2.5, fontSize: 22, fontWeight: 800 }}>
              {query || typeFilter !== 'ALL' ? 'No matching members' : 'No members yet'}
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary', maxWidth: 380, mx: 'auto' }}>
              {query || typeFilter !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by adding a new member to the savings circle.'}
            </Typography>
            {!query && typeFilter === 'ALL' && (
              <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: 'center' }}>
                <Button variant="contained" onClick={() => setIsCreateOpen(true)}>
                  Add member
                </Button>
                <Button variant="outlined" startIcon={<Upload size={16} />} onClick={() => setIsUploadOpen(true)}>
                  Import from file
                </Button>
              </Stack>
            )}
          </Paper>
        )}

        {/* ---- Create member dialog ---- */}
        <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Add new member</DialogTitle>
          <DialogContent>
            <MemberForm
              onSuccess={() => {
                setIsCreateOpen(false);
                fetchMembers();
              }}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* ---- Edit member dialog ---- */}
        <Dialog
          open={Boolean(editingMember)}
          onClose={() => setEditingMemberId(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Edit member</DialogTitle>
          <DialogContent>
            {editingMember && (
              <MemberForm
                member={editingMember}
                onSuccess={() => {
                  setEditingMemberId(null);
                  fetchMembers();
                }}
                onCancel={() => setEditingMemberId(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* ---- Member details dialog ---- */}
        <MemberDetailsDialog
          open={Boolean(viewingMember)}
          member={viewingMember}
          onClose={() => setViewingMemberId(null)}
          onMemberUpdated={() => fetchMembers()}
        />

        {/* ---- Delete confirmation dialog ---- */}
        <Dialog
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Delete member</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete <strong>{deleteTarget?.names}</strong>? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ---- Upload members dialog ---- */}
        <Dialog
          open={isUploadOpen}
          onClose={() => {
            if (!isUploading) {
              setIsUploadOpen(false);
              setUploadFile(null);
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              Import members
            </Typography>
            {!isUploading && (
              <IconButton
                size="small"
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadFile(null);
                }}
              >
                <X size={20} />
              </IconButton>
            )}
          </DialogTitle>

          <DialogContent>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2.5 }}>
              Upload an Excel (.xlsx) or CSV file with member data. The file should include columns
              for name, phone, ID number, amount, currency and address.
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            {!uploadFile ? (
              <Paper
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  border: '2px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.soft' },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp size={32} color="#888" />
                <Typography sx={{ mt: 1.5, fontWeight: 700 }}>
                  Click to select a file
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
                  .xlsx or .csv — max 10 MB
                </Typography>
              </Paper>
            ) : (
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: 'background.warm',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <FileUp size={24} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
                    {uploadFile.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {(uploadFile.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
                {!isUploading && (
                  <IconButton size="small" onClick={() => setUploadFile(null)}>
                    <X size={16} />
                  </IconButton>
                )}
              </Paper>
            )}

            {isUploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ borderRadius: 4, height: 6 }}
                />
                <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary', textAlign: 'center' }}>
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}

            {uploadResult && (
              <Alert
                severity={uploadResult.failedCount > 0 ? 'warning' : 'success'}
                sx={{ mt: 2 }}
              >
                {uploadResult.successCount} of {uploadResult.totalRecords} members imported
                successfully.
                {uploadResult.failedCount > 0 &&
                  ` ${uploadResult.failedCount} failed.`}
              </Alert>
            )}
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                setIsUploadOpen(false);
                setUploadFile(null);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!uploadFile || isUploading}
              startIcon={isUploading ? <CircularProgress size={16} /> : <Upload size={16} />}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
