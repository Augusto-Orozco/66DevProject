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

        <a className="footer-link">Términos de uso y privacidad</a>
        <a className="footer-link">Preferencias sobre cookies</a>
        <a className="footer-link">Opciones para los anuncios</a>
        <a className="footer-link">Oportunidades profesionales</a>
        <a className="footer-link">Línea de ayuda de integridad</a>
        <a className="footer-link">Contáctanos</a>
      </Box>

      {/* RIGHT SIDE */}
      <Box className="footer-right">
        <IconButton><FacebookIcon /></IconButton>
        <IconButton><XIcon /></IconButton>
        <IconButton><LinkedInIcon /></IconButton>
        <IconButton><YouTubeIcon /></IconButton>
        <IconButton><InstagramIcon /></IconButton>
      </Box>

    </Box>
  )
}

export default Footer