import React, {
  useState
} from 'react';
import { useSelector, useDispatch } from 'react-redux'; 

import { useHistory } from "react-router-dom";
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Button from '../form/Button';
import queryString from 'query-string';
import Modal from 'react-modal';
import Input from '../form/Input';
import { updateGraphDataRequest,  getGraphsListRequest }
  from '../../store/actions/graphs'; 

const UpdateGraphModal = ({ graph, closeModal }) => {
  const dispatch = useDispatch();
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false);
  const [graphData, setGraphData] = useState(graph);
  const { page = 1, s: searchParam } = queryString.parse(window.location.search);

  const updateGraph = async (event) => { 
    event.preventDefault();
    try {
      const { payload: { data } } = await dispatch(updateGraphDataRequest(graphData.id,
        { title: graphData.title, description: graphData.description })
      );
      await dispatch(getGraphsListRequest(page, { s: searchParam }));
      closeModal()
      history.push('/');
      toast.info('Successfully saved');

    } catch (e) {
      console.log(e)
    }
  }

  const handleChange = (path, value) => {
    setGraphData({ ...graphData, [path]: value });
  }

  // useEffect(() => { 
  //     console.log('sss'); 
  //    dispatch(getGraphsListRequest(page, { s: searchParam }));

  // }, [dispatch, updateGraphDataRequest]);

  return (
    <Modal
      className="ghModal ghModalSave"
      overlayClassName="ghModalOverlay"
      isOpen
    >
      <h2> Update Graph </h2>
      <Input
        label="Title"
        value={graphData.title}
        onChangeText={(v) => handleChange('title', v)}
      />
      <Input
        label="Description"
        value={graphData.description}
        textArea
        onChangeText={(v) => handleChange('description', v)}
      />
      <div className="buttons">
        <Button onClick={() => closeModal()}>
          Cancel
      </Button>
        <Button
          className="saveNode"
          disabled={!graphData.title}
          onClick={updateGraph}
        >
          Update
      </Button>
      </div>
    </Modal>
  );
};

UpdateGraphModal.propTypes = {
  graph: PropTypes.object.isRequired
};

export default React.memo(UpdateGraphModal);
