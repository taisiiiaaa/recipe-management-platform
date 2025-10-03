import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import { Rating } from '@mui/material'

export const ToggleSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "var(--color-button-primary)",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "var(--color-button-primary)",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#fff",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: 'var(--color-stroke)',
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "var(--color-stroke)",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));

export const StarRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-icon': {
    color: theme.palette.mode === 'dark' ? 'var(--color-text)' : 'var(--color-text)', 
  },
  '& .MuiRating-iconFilled': {
    color: theme.palette.mode === 'dark' ? 'var(--color-button-primary)' : 'var(--color-button-primary)', 
  },
  '& .MuiRating-iconHover': {
    color: theme.palette.mode === 'dark' ? 'var(--color-button-primary)' : 'var(--color-button-primary)', 
  },
}));
