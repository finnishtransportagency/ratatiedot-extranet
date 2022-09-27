import chai from 'chai';
import chaiHttp from 'chai-http';

import app from '../../index';

chai.use(chaiHttp);
chai.should();

describe('GET /api', () => {
  it('status: 200', (done: any) => {
    chai
      .request(app)
      .get('/api')
      .end((_, res) => {
        res.should.have.status(200);
        res.text.should.contain('{"data":"Ratatiedot Extranet API"}');
        done();
      });
  });
  it('Ratatiedot Extranet API', (done: any) => {
    chai
      .request(app)
      .get('/api')
      .end((_, res) => {
        res.text.should.contain('{"data":"Ratatiedot Extranet API"}');
        res.body.data.should.contain('Ratatiedot Extranet API');
        done();
      });
  });
});
