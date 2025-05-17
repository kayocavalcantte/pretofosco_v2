import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { MapPin, Phone, Instagram } from 'lucide-react';
import '../styles/Footer.scss';
import '../styles/Header.scss';import { FaWhatsapp } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <Container>
        <Row className="justify-content-center text-center py-3">
          <Col xs={12} md={4} className="footer-col mb-3 mb-md-0">
            <MapPin size={18} className="me-2" />
            <span>R. Joaquim Magalhães, 131 - Benfica</span>
          </Col>

          <Col xs={12} md={4} className="footer-col mb-3 mb-md-0">
      <FaWhatsapp size={18} className="me-2" />
              <a
              href="https://wa.me/message/6F2P4DSKLGZVH1"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
                >
            WhatsApp
          </a>
        </Col>


          <Col xs={12} md={4} className="footer-col">
            <Instagram size={18} className="me-2" />
            <a
              href="https://www.instagram.com/peluqueriapretofosco/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              @peluqueriapretofosco
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;