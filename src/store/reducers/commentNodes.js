import {
  CREATE_COMMENT_NODE,
  GET_NODE_COMMENTS,
  SET_COMMENT_PARENT,
  DELETE_NODE_COMMENT,
} from '../actions/commentNodes';

const initialState = {
  nodeComments: [],
  nodeCommentParent: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_COMMENT_NODE.SUCCESS: {
      const {
        nodeComments,
      } = action.payload.data;
      const comments = [...state.nodeComments];

      if (nodeComments.parentId) {
        const parent = comments.findIndex((comment) => comment.id === nodeComments.parentId);

        const { children } = comments[parent];
        if (children) {
          children.push(nodeComments);
        } else {
          comments[parent].children = [nodeComments];
        }
      } else {
        comments.push(nodeComments);
      }

      return {
        ...state,
        nodeComments: comments,
      };
    }
    case SET_COMMENT_PARENT: {
      return {
        ...state,
        nodeCommentParent: action.payload,
      };
    }
    case GET_NODE_COMMENTS.SUCCESS: {
      const {
        nodeComments,
      } = action.payload.data;

      return {
        ...state, nodeComments,
      };
    }
    case DELETE_NODE_COMMENT.SUCCESS: {
      const {
        id,
      } = action.payload.data;

      return {
        ...state,
        nodeComments: state.nodeComments.filter(
          (comment) => {
            comment.children = comment.children?.filter((reply) => +reply.id !== +id);
            return +comment.id !== +id;
          },
        ),
        nodeCommentParent: {},
      };
    }
    default: {
      return state;
    }
  }
}
