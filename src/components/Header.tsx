import React, { useState, useEffect } from 'react';
import { Navbar, Container, Form, Button, Row, Col } from 'react-bootstrap';


const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Navbar expand="lg" className={`navbar-dark ${scrolled ? 'scrolled' : ''}`}>
      <Container fluid="lg">
        <Row className="w-100 align-items-center">
          <Col xs={12} lg={4}>
          </Col>

          <Col xs={12} lg={8}>
            <Form className="d-flex login-form">
              <Row className="w-100 align-items-center justify-content-end">
                <Col xs={12} sm={5} lg={4} xl={3} className="pe-sm-2 mb-2 mb-sm-0">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    className="me-sm-2"
                    size="sm"
                  />
                </Col>
                <Col xs={12} sm={5} lg={4} xl={3} className="pe-sm-2 mb-2 mb-sm-0">
                  <Form.Control
                    type="password"
                    placeholder="Senha"
                    className="me-sm-2"
                    size="sm"
                  />
                </Col>
                <Col xs={12} sm="auto">
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="w-100"
                  >
                    ENTRAR
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
};

export default Header;