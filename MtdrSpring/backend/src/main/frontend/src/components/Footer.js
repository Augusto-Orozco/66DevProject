import { Box, Typography, IconButton } from '@mui/material'
import YouTubeIcon from '@mui/icons-material/YouTube'
import '../Assets/styles.css'

function Footer() {
  return (
    <Box className="footer-container">
      <Box className="footer-left">
        <Typography variant="body2">© 2026 SmarTask</Typography>
        <span className="footer-divider">|</span>
      </Box>
    </Box>
  )
}

export default Footer