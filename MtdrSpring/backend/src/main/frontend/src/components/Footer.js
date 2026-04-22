import { Box, Typography, IconButton } from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'
import XIcon from '@mui/icons-material/X'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import YouTubeIcon from '@mui/icons-material/YouTube'
import InstagramIcon from '@mui/icons-material/Instagram'
import '../Assets/styles.css'

function Footer() {
  return (
    <Box className="footer-container">

      {/* LEFT SIDE */}
      <Box className="footer-left">
        <Typography variant="body2">© 2026 SmarTask</Typography>

        <span className="footer-divider">|</span>

        <a href="*" target="_blank" rel="noopener noreferrer" className="footer-link">Contáctanos</a>
      </Box>

      {/* RIGHT SIDE */}
      <Box className="footer-right">
        <IconButton component="a" href="https://youtu.be/u4ecB57jFhI?si=JUfH5BoH6iR1yHxP" target="_blank"><YouTubeIcon /></IconButton>
      </Box>

    </Box>
  )
}

export default Footer