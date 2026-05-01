import { useState, useRef, useEffect, forwardRef, Fragment } from 'react';
import { Box, Button, Grid, IconButton, TextField, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, CircularProgress } from '@mui/material';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import { OTPInput } from 'input-otp';
import gsap from 'gsap';
import { useForm } from "react-hook-form";
import AuthServices from '../api/auth';
import toastify from '../components/toast';

const Transition = forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

function Slot(props) {
	return (
		<div
			style={{
				width: '48px',
				height: '48px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: '1.5rem',
				fontWeight: 'bold',
				border: '1px solid #ccc',
				borderRadius: '8px',
				background: props.isActive ? '#f0f0f0' : 'white',
			}}
		>
			{props.char !== null ? props.char : props.placeholderChar}
		</div>
	);
};

function OTPDialog({ open, handleClose, email, seconds }) {
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isLoading2, setIsLoading2] = useState(false);
	const { handleSubmit } = useForm();

	const verifyOtp = async () => {
		setIsLoading(true);
		const obj = { email, otp };
		try {
			const result = await toastify(AuthServices.verifyOtp(obj));
			if (result?.status) {
				handleClose();
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	const resendOtp = async () => {
		setIsLoading2(true);
		try {
			const obj = { email };
			await toastify(AuthServices.resendOtp(obj));
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading2(false);
		};
	};

	return (
		<Fragment>
			<Dialog
				open={open}
				slots={{
					transition: Transition,
				}}
				keepMounted
				onClose={handleClose}
				aria-describedby="otp-dialog"
				role="alertdialog"
				component={"form"}
				onSubmit={handleSubmit(verifyOtp)}
			>
				<DialogTitle
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between"
					}}
				>
					<Typography variant={"h5"}>
						OTP Verification
					</Typography>
					<IconButton
						onClick={handleClose}
					>
						<Close />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<DialogContentText
						id="otp-dialog"
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 1
						}}
					>
						<Typography sx={{ fontSize: "18px" }}>Enter the 6-digit code</Typography>
						<Typography variant={"subtitle2"}>{`sent to: ${email}`}</Typography>
					</DialogContentText>
					<OTPInput
						className='otp-input'
						maxLength={6}
						onChange={(val) => setOtp(val)}
						render={({ slots }) => (
							<div style={{ display: 'flex', justifyContent: "center", gap: '12px', marginTop: '16px' }}>
								{slots.map((slot, idx) => (
									<Slot key={idx} {...slot} />
								))}
							</div>
						)}
					/>
				</DialogContent>
				<DialogActions
					sx={{
						padding: "0 24px 24px",
						flexDirection: "column",
						gap: 1
					}}
				>
					<Button
						loading={isLoading}
						disabled={isLoading}
						variant={'contained'}
						fullWidth={true}
						type='submit'
					>
						Verify
					</Button>
					<Button
						onClick={resendOtp}
						variant={'outlined'}
						fullWidth={true}
						disabled={seconds > 0}
						sx={{ margin: "0 !important" }}
					>
						{seconds > 0 ? `Resend OTP in ${seconds}` : "Resend OTP"}
					</Button>
				</DialogActions>
			</Dialog>
		</Fragment>
	);
};

function Login() {
	const [isShown, setIsShown] = useState(false);
	const [isLogin, setIsLogin] = useState(true);
	const [isOTPDialogOpen, setIsOTPDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [seconds, setSeconds] = useState(0);

	const animationRef = useRef(null);
	const loginCardRef = useRef(null);
	const signupCardRef = useRef(null);

	const {
		register: register1,
		handleSubmit: handleSubmit1,
		formState: {
			errors: errors1
		}
	} = useForm();
	const {
		register: register2,
		handleSubmit: handleSubmit2,
		formState: {
			errors: errors2
		},
		watch: watch2
	} = useForm();

	const watchPassword = watch2("password");

	const startCountDown = () => {
		setSeconds(3);
		const interval = setInterval(() => {
			setSeconds((prev) => {
				if (prev <= 1) clearInterval(interval);
				return prev - 1;
			})
		}, 1000);
	};

	const handleOTPDialog = () => {
		setIsOTPDialogOpen((prev) => !prev);
	};

	const handleShown = () => {
		setIsShown((prev) => !prev)
	};

	const toggleForm = () => {
		if (animationRef.current) animationRef.current.kill();

		const duration = 0.55;
		const ease = "power3.inOut";

		if (isLogin) {
			gsap.set(signupCardRef.current, { display: "flex", x: "100%", opacity: 0, zIndex: 2 });
			gsap.set(loginCardRef.current, { zIndex: 1 });

			const tl = gsap.timeline();
			tl.to(loginCardRef.current, { x: "-100%", opacity: 0, duration, ease }, 0);
			tl.fromTo(signupCardRef.current, { x: "100%", opacity: 0 }, { x: "0%", opacity: 1, duration, ease }, 0);
			tl.set(loginCardRef.current, { display: "none" }, "+=0.1");
			animationRef.current = tl;
		} else {
			gsap.set(loginCardRef.current, { display: "flex", x: "-100%", opacity: 0, zIndex: 2 });
			gsap.set(signupCardRef.current, { zIndex: 1 });

			const tl = gsap.timeline();
			tl.to(signupCardRef.current, { x: "100%", opacity: 0, duration, ease }, 0);
			tl.fromTo(loginCardRef.current, { x: "-100%", opacity: 0 }, { x: "0%", opacity: 1, duration, ease }, 0);
			tl.set(signupCardRef.current, { display: "none" }, "+=0.1");
			animationRef.current = tl;
		}

		setIsLogin(!isLogin);
	};

	const handleLogin = async (data) => {
		setIsLoading(true);
		const obj = { email: data.email, password: data.password };
		try {
			const result = await toastify(AuthServices.login(obj));
			if (result.status) {
				console.log(result);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		};
	};

	const handleSignUp = async (data) => {
		setIsLoading(true);
		const obj = {
			name: data.name,
			email: data.email,
			password: data.password,
			phone_number: data.phone_number
		};
		try {
			const result = await AuthServices.signUp(obj);
			if (result?.status) {
				startCountDown();
				handleOTPDialog();
				setEmail(obj.email);
			};
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		};
	};

	useEffect(() => {
		gsap.set(loginCardRef.current, { x: "0%", opacity: 1, display: "flex", zIndex: 2, y: "-50%" });
		gsap.set(signupCardRef.current, { x: "100%", opacity: 0, display: "none", zIndex: 1, y: "-50%" });
	}, []);

	return (
		<Fragment>
			<OTPDialog
				open={isOTPDialogOpen}
				handleClose={handleOTPDialog}
				email={email}
				seconds={seconds}
			/>
			<Box
				sx={{
					background: "linear-gradient(45deg, #030027, #00EFFF)",
					height: "100vh",
					width: "100%",
					position: "relative",
					overflow: "hidden"
				}}
			>
				<Grid
					container
					sx={{
						height: "100%",
						alignItems: "center",
						justifyContent: "center",
						position: "relative"
					}}
				>
					<Box
						sx={{
							position: "relative",
							width: { xs: "90%", sm: "70%", md: "33.333%" },
							minWidth: 300,
							height: "auto"
						}}
					>
						<Grid
							ref={loginCardRef}
							container
							spacing={2}
							component={"form"}
							onSubmit={handleSubmit1(handleLogin)}
							sx={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								padding: 3,
								borderRadius: 2,
								backdropFilter: "blur(10px)",
								background: "#FFFFFF",
								boxShadow: "0px 0px 15px 3px #2B2B2B",
								willChange: "transform, opacity",
								margin: 0,
							}}
						>
							<Grid size={12}>
								<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
									<Typography variant="h4">Welcome Back</Typography>
									<Typography variant="subtitle1">Enter your credentials</Typography>
								</Box>
							</Grid>
							<Grid size={12}>
								<TextField
									fullWidth
									label="Email"
									type="text"
									variant="outlined"
									size="medium"
									error={errors1?.email && true}
									helperText={errors1?.email?.message}
									{...register1("email", {
										required: "Please enter your email"
									})}
								/>
							</Grid>
							<Grid size={12}>
								<TextField
									fullWidth
									label="Password"
									type={isShown ? "text" : "password"}
									variant="outlined"
									size="medium"
									slotProps={{
										input: {
											endAdornment: (
												<IconButton onClick={handleShown}>
													{isShown ? <VisibilityOff /> : <Visibility />}
												</IconButton>
											)
										}
									}}
									error={errors1?.password && true}
									helperText={errors1?.password?.message}
									{...register1("password", {
										required: "Please enter your password"
									})}
								/>
							</Grid>
							<Grid size={12}>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
									<Typography variant="subtitle2" sx={{ cursor: 'pointer' }}>Forgot Password?</Typography>
									<Typography variant="subtitle2" sx={{ cursor: 'pointer' }} onClick={toggleForm}>
										Don't have an account?
									</Typography>
								</Box>
							</Grid>
							<Grid size={12}>
								<Button
									fullWidth
									size="medium"
									variant="contained"
									type='submit'
									loading={isLoading}
									disabled={isLoading}
								>
									Login
								</Button>
							</Grid>
						</Grid>

						<Grid
							ref={signupCardRef}
							container
							spacing={2}
							component={"form"}
							onSubmit={handleSubmit2(handleSignUp)}
							sx={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								padding: 3,
								borderRadius: 2,
								backdropFilter: "blur(10px)",
								background: "#FFFFFF",
								boxShadow: "0px 0px 15px 3px #2B2B2B",
								willChange: "transform, opacity",
								margin: 0,
							}}
						>
							<Grid size={12}>
								<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
									<Typography variant="h4">Create Account</Typography>
									<Typography variant="subtitle1">Sign up to get started</Typography>
								</Box>
							</Grid>
							<Grid size={12}>
								<TextField
									fullWidth
									label="Full Name"
									type="text"
									variant="outlined"
									size="medium"
									{...register2("name")}
								/>
							</Grid>
							<Grid size={12}>
								<TextField
									fullWidth
									label="Email"
									type="email"
									variant="outlined"
									size="medium"
									error={errors2?.email && true}
									helperText={errors2?.email?.message}
									{...register2("email", {
										required: "Please enter your email"
									})}
								/>
							</Grid>
							<Grid size={12}>
								<TextField
									fullWidth
									label="Password"
									type={"password"}
									variant="outlined"
									size="medium"
									{...register2("password", {
										required: "Please enter your password"
									})}
									error={errors2?.password && true}
									helperText={errors2?.password?.message}
								/>
							</Grid>
							<Grid size={12}>
								<TextField
									fullWidth
									label="Confirm Password"
									type="password"
									variant="outlined"
									size="medium"
									{...register2("cnfPassword", {
										validate: (value) =>
											value === watchPassword || "Passwords do not match"
									})}
									error={errors2?.cnfPassword && true}
									helperText={errors2?.cnfPassword?.message}
								/>
							</Grid>
							<Grid size={12}>
								<TextField
									fullWidth
									label="Phone Number"
									type="number"
									variant="outlined"
									size="medium"
									error={errors2?.phone_number && true}
									helperText={errors2?.phone_number?.message}
									{...register2("phone_number", {
										required: "Please enter your phone number"
									})}
								/>
							</Grid>
							<Grid size={12}>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									<Typography variant="subtitle2" sx={{ cursor: 'pointer' }} onClick={toggleForm}>
										Already have an account? Sign In
									</Typography>
								</Box>
							</Grid>
							<Grid size={12}>
								<Button
									fullWidth
									size="medium"
									variant="contained"
									type="submit"
									loading={isLoading}
									disabled={isLoading}
								>
									Sign Up
								</Button>
							</Grid>
						</Grid>
					</Box>
				</Grid>
			</Box>
		</Fragment>
	);
};

export default Login;