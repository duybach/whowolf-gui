import React from 'react';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

class Home extends React.Component {
  render() {
    return (
      <Container>
        <Row>
          <Col>
            <h1>Home</h1>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <Button href="/lobby/join" variant="primary">Join Game</Button>
          </Col>

          <Col xs={12} md={6}>
            <Button href="/lobby/create" variant="primary">Create Game</Button>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default Home
