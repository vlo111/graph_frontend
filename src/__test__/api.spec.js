import axios from 'axios';
import signIn from './helpers/user/signIn';
import signUp from './helpers/user/signUp';

const { REACT_APP_API_URL } = process.env;

jest.unmock('axios');

describe('request create node', () => {
  const userRequestData = {
    firstName: 'testFirstName',
    lastName: 'testLastName',
    email: 'test@test.com',
    website: null,
    status: true,
    bio: null,
    facebook: null,
    twitter: null,
    linkedin: null,
    skype: null,
  };

  const graphRequestData = {
    title: 'graphTestName',
    description: 'graph test description text',
    status: 'active',
  };

  const nodeRequestData = {
    id: '_uniq_1.00b2d777-03b4-407b-ae4b-ccef55c3169d',
    index: 0,
    fx: 536,
    fy: 468,
    name: 'nameTest',
    type: 'typeTest',
    status: 'approved',
    nodeType: 'circle',
    description: '',
    icon: '',
    link: '',
    keywords: [
      'keywordTest',
      'keyword1Test',
    ],
    color: '#fc0000',
    createdUser: 'eeef8df6-cb92-4dfc-8a8c-25e8c1e09838',
    updatedUser: 'eeef8df6-cb92-4dfc-8a8c-25e8c1e09838',
    labels: [],
    manually_size: 5,
    customFields: [],
  };

  let user = null;
  let status = '';
  let token = '';
  let graphId = null;
  let nodes = null;
  let errors = null;

  const getData = (uri, formData) => axios.post(`${REACT_APP_API_URL}${uri}`, formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  const cleanUserForExpect = (user) => {
    delete user.id;
    delete user.avatar;
    delete user.createdAt;
    delete user.updatedAt;
  };

  const cleanNodeForExpect = (node) => {
    delete node.createdAt;
    delete node.updatedAt;
  };

  beforeEach(async () => {
    try {
      ({
        user, status, token,
      } = await signIn('test@test.com', 'testPassword1'));
    } catch (e) {
      if (!user) {
        user = await signUp();
      }
    }
  });

  it('should be created user', async () => {
    expect(status).toMatch('ok');

    cleanUserForExpect(user);

    expect(user).toEqual(userRequestData);
  });

  it('should be created graph', async () => {
    ({ data: { status, graphId } } = await getData('graphs/create', graphRequestData));

    expect(status).toMatch('ok');

    expect(graphId).not.toBeNull();
  });

  it('should be created node', async () => {
    ({ data: { status, errors, nodes } } = await getData(`nodes/create/${graphId}`, { nodes: [nodeRequestData] }));

    expect(Array.isArray(nodes)).toBe(true);

    const node = nodes[0];

    cleanNodeForExpect(node);

    expect(status).toMatch('ok');

    expect(errors).toEqual([]);

    expect(node).toEqual(nodeRequestData);
  });

  it('should be deleted node', async () => {
    // await Api.deleteGraph(graphId);
  });
});
