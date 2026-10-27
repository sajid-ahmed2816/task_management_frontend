import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CameraAltOutlined,
  CheckCircleOutlineRounded,
  CloudUploadOutlined,
  LockResetRounded,
  MailOutlineRounded,
  PhoneIphoneOutlined,
  PersonOutlineRounded,
  SecurityRounded,
  VisibilityOffRounded,
  VisibilityRounded,
} from "@mui/icons-material";
import AuthServices from "../../../api/auth";
import toastify from "../../../components/toast";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function ProfilePanel({ user, userLogin }) {
  const fileInputRef = useRef(null);
  const userLoginRef = useRef(userLogin);
  userLoginRef.current = userLogin;
  const currentUserRef = useRef(user);
  currentUserRef.current = user;
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    profile_picture: user?.profile_picture || ""
  });
  const [pictureFile, setPictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let active = true;
    AuthServices.getProfile().then((response) => {
      if (!active || !response?.status || !response?.data) return;
      const data = response.data;
      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        profile_picture: data.profile_picture || "",
      });
      const currentUser = currentUserRef.current;
      userLoginRef.current?.({ ...currentUser, ...data, token: currentUser?.token });
    }).catch((error) => {
      if (active) setProfileError(error?.message || "Could not load your profile.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [user?._id]);

  useEffect(() => {
    if (!pictureFile) {
      setPreviewUrl("");
      return undefined;
    }
    const objectUrl = URL.createObjectURL(pictureFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pictureFile]);

  useEffect(() => {
    if (!passwordDialogOpen || resendSeconds <= 0) return undefined;
    const timer = setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearTimeout(timer);
  }, [passwordDialogOpen, resendSeconds]);

  const handleProfileChange = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }));
  };

  const handlePictureSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPictureFile(null);
      setProfileError("Choose an image file to use as your profile photo.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setPictureFile(null);
      setProfileError("Profile photos must be 5 MB or smaller.");
      return;
    }
    setProfileError("");
    setPictureFile(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    const name = profile.name.trim();
    const phoneNumber = profile.phone_number.trim();
    if (!name || !phoneNumber) {
      setProfileError("Name and phone number are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone_number", phoneNumber);
    if (pictureFile) formData.append("profile_picture", pictureFile);

    setSaving(true);
    setProfileError("");
    try {
      const response = await toastify(AuthServices.updateProfile(formData));
      if (!response?.status || !response?.data) throw new Error(response?.message || "Profile was not updated.");
      const data = response.data;
      setProfile({ name: data.name || name, email: data.email || profile.email, phone_number: data.phone_number || phoneNumber, profile_picture: data.profile_picture || "" });
      setPictureFile(null);
      userLogin?.({ ...user, ...data, token: user?.token });
    } catch (error) {
      setProfileError(error?.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const requestPasswordOtp = async (isResend = false) => {
    setOtpSending(true);
    setPasswordError("");
    try {
      const response = await toastify(AuthServices.requestPasswordChangeOtp());
      if (!response?.status) {
        throw new Error(response?.message || "Could not send the verification code.");
      };
      setPasswordDialogOpen(true);
      setResendSeconds(60);
      if (!isResend) {
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setPasswordError(error?.message || "Could not send the verification code.");
    } finally {
      setOtpSending(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setPasswordError("Enter the 6-digit code sent to your email.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Your new password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("The passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");
    try {
      const response = await toastify(AuthServices.verifyPasswordChangeOtp({ email: user.email, otp, newPassword }));
      if (!response?.status) throw new Error(response?.message || "Password was not changed.");
      setPasswordDialogOpen(false);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error?.message || "Could not change your password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const closePasswordDialog = () => {
    if (passwordLoading || otpSending) return;
    setPasswordDialogOpen(false);
    setPasswordError("");
  };

  const image = previewUrl || profile.profile_picture;

  return (
    <Grid container spacing={2}>
      {profileError && <Alert severity="error" onClose={() => setProfileError("")}>{profileError}</Alert>}

      <Grid size={12}>
        <Card
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            border: "1px solid #E7EDF0",
            borderRadius: 4,
            background: "linear-gradient(115deg, #f2faf9 0%, #ffffff 72%)",
            overflow: "hidden",
            position: "relative"
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 210,
              height: 210,
              borderRadius: "50%",
              bgcolor: "#dff2ef",
              right: -90,
              top: -125,
              opacity: .6
            }}
          />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              position: "relative",
              alignItems: { xs: "flex-start", sm: "center" }
            }}
          >
            <Box
              sx={{
                position: "relative",
                flexShrink: 0
              }}
            >
              <Avatar
                src={image || undefined}
                alt={profile.name}
                sx={{
                  width: 78,
                  height: 78,
                  bgcolor: "#DCEFF2",
                  color: "#024F6E",
                  fontSize: 28,
                  fontWeight: 800,
                  border: "3px solid #fff",
                  boxShadow: "0 4px 14px #173a491a"
                }}
              >
                {profile.name?.trim()?.[0]?.toUpperCase() || "U"}
              </Avatar>
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                aria-label={image ? "Change profile photo" : "Upload profile photo"}
                sx={{
                  position: "absolute",
                  right: -4,
                  bottom: 0,
                  width: 30,
                  height: 30,
                  bgcolor: "#024f6e",
                  color: "#fff",
                  border: "2px solid #fff",
                  "&:hover": {
                    bgcolor: "#013d54"
                  }
                }}
              >
                <CameraAltOutlined sx={{ fontSize: 16 }} />
              </IconButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handlePictureSelect}
              />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  flexWrap: "wrap",
                  alignItems: "center"
                }}
              >
                <Typography
                  sx={{
                    color: "#19333E",
                    fontWeight: 800,
                    fontSize: 19
                  }}
                >
                  {profile.name || "Your profile"}
                </Typography>
                <Chip
                  size="small"
                  icon={<CheckCircleOutlineRounded sx={{ "&&": { color: "#168d78" } }} />}
                  label="Personal account"
                  sx={{
                    height: 24,
                    bgcolor: "#e4f4ef",
                    color: "#16776e",
                    fontSize: 11,
                    fontWeight: 700
                  }}
                />
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  mt: .35,
                  color: "#71828D",
                  overflowWrap: "anywhere"
                }}
              >
                {profile.email || "Your account details"}
              </Typography>
              <Stack
                direction="row"
                spacing={.75}
                sx={{
                  mt: 1.1,
                  alignItems: "center"
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CloudUploadOutlined />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    bgcolor: "#fff",
                    borderColor: "#d8e5e5",
                    color: "#315662"
                  }}
                >
                  {image ? "Change photo" : "Add photo"}
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Image up to 5 MB
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Card>
      </Grid>

      <Grid size={6}>
        <Card
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            border: "1px solid #DFE9E8",
            borderRadius: 4,
            background: "linear-gradient(115deg, #f5faf9 0%, #ffffff 78%)"
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              mb: 2,
              alignItems: "center"
            }}
          >
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: "#E6F3F0",
                color: "#287b70",
                flexShrink: 0
              }}
            >
              <SecurityRounded />
            </Box>
            <Box>
              <Typography
                sx={{
                  color: "#243844",
                  fontWeight: 800,
                  fontSize: 15
                }}
              >
                Password and security
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: .2 }}
              >
                Keep your account access secure.
              </Typography>
            </Box>
          </Stack>
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              border: "1px solid #E5EEEC",
              borderRadius: 2.5,
              bgcolor: "#fff"
            }}
          >
            <Stack
              direction={"column"}
              spacing={2}
              sx={{
                alignItems: "flex-end",
                justifyContent: "space-between"
              }}
            >
              <Stack
                direction="row"
                spacing={1.25}
                sx={{
                  alignItems: "flex-start"
                }}
              >
                <Box
                  sx={{
                    mt: .2,
                    display: "grid",
                    placeItems: "center",
                    width: 34,
                    height: 34,
                    borderRadius: 1.8,
                    bgcolor: "#f1f6f6",
                    color: "#4b7279",
                    flexShrink: 0
                  }}
                >
                  <LockResetRounded sx={{ fontSize: 19 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      color: "#30434d",
                      fontWeight: 750,
                      fontSize: 14
                    }}
                  >
                    Update your password
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: .25,
                      maxWidth: 500
                    }}
                  >
                    We’ll send a 6-digit verification code to&nbsp;
                    <Box
                      component="span"
                      sx={{
                        color: "#435c66",
                        fontWeight: 700
                      }}
                    >
                      {profile.email || "your account email"}.&nbsp;
                    </Box>
                    Verify it to set a new password.
                  </Typography>
                  <Chip
                    size="small"
                    icon={<MailOutlineRounded sx={{ "&&": { color: "#397d79" } }} />}
                    label="Email verification required"
                    sx={{
                      mt: 1,
                      height: 23,
                      bgcolor: "#f0f7f5",
                      color: "#39756e",
                      fontSize: 11,
                      fontWeight: 700
                    }}
                  />
                </Box>
              </Stack>
              <Button
                variant="contained"
                startIcon={otpSending ? <CircularProgress size={18} color="inherit" /> : <LockResetRounded />}
                onClick={() => requestPasswordOtp()}
                disabled={!profile.email || otpSending}
              >
                {otpSending ? "Sending code…" : "Change password"}
              </Button>
            </Stack>
          </Box>
        </Card>
      </Grid>

      <Grid size={6}>
        <Card
          component="form"
          onSubmit={saveProfile}
          elevation={0}
          sx={{
            border: "1px solid #e7edf0",
            borderRadius: 4,
            overflow: "hidden"
          }}
        >
          <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                mb: 2.25,
                alignItems: "center"
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: "#EDF5F5",
                  color: "#397D79",
                  flexShrink: 0
                }}
              >
                <PersonOutlineRounded />
              </Box>
              <Box>
                <Typography
                  sx={{
                    color: "#243844",
                    fontWeight: 800,
                    fontSize: 15
                  }}
                >
                  Personal information
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: .2 }}
                >
                  These details appear on your workspace profile.
                </Typography>
              </Box>
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Full name"
                  placeholder="Enter your name"
                  value={profile.name}
                  onChange={handleProfileChange("name")}
                  disabled={loading || saving}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone number"
                  placeholder="Add a contact number"
                  value={profile.phone_number}
                  onChange={handleProfileChange("phone_number")}
                  disabled={loading || saving}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIphoneOutlined sx={{ color: "#82939c", fontSize: 19 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Email address"
                  value={profile.email}
                  disabled
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlineRounded sx={{ color: "#82939c", fontSize: 19 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          <Divider sx={{ borderColor: "#edf1f2" }} />
          <Stack
            direction="row"
            sx={{
              p: 1.75,
              bgcolor: "#FCFDFD",
              justifyContent: "flex-end"
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={loading || saving || !profile.name.trim() || !profile.phone_number.trim()}
              startIcon={saving ?
                <CircularProgress size={18} color="inherit" /> :
                <CheckCircleOutlineRounded />
              }
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </Stack>
        </Card>
      </Grid>

      {passwordError && !passwordDialogOpen && <Alert severity="error">{passwordError}</Alert>}

      <Dialog open={passwordDialogOpen} onClose={closePasswordDialog} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={changePassword}>
          <DialogTitle>Verify and change password</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the verification code sent to <strong>{profile.email}</strong>, then choose a new password.
            </Typography>
            {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
            <Stack spacing={2}>
              <TextField
                fullWidth label="6-digit verification code" value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputProps={{ inputMode: "numeric", maxLength: 6 }} required
              />
              <TextField
                fullWidth label="New password" type={showPassword ? "text" : "password"}
                value={newPassword} onChange={(event) => setNewPassword(event.target.value)}
                helperText="Use at least 8 characters."
                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword((shown) => !shown)} edge="end" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}</IconButton></InputAdornment> }} required
              />
              <TextField
                fullWidth label="Confirm new password" type={showPassword ? "text" : "password"}
                value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required
              />
            </Stack>
            <Box sx={{ mt: 1.5, textAlign: "right" }}>
              <Button size="small" onClick={() => requestPasswordOtp(true)} disabled={otpSending || resendSeconds > 0}>
                {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={closePasswordDialog} disabled={passwordLoading || otpSending}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={passwordLoading || otpSending}>
              {passwordLoading ? <CircularProgress size={18} color="inherit" /> : "Verify and update"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Grid>
  );
}

ProfilePanel.propTypes = {
  user: PropTypes.object,
  userLogin: PropTypes.func,
};

export default ProfilePanel;
