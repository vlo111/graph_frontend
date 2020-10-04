import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGraphComments } from '../../../store/selectors/commentGraphs';
import { getGraphCommentsRequest } from '../../../store/actions/commentGraphs';
import { getSingleGraph } from '../../../store/selectors/graphs';

export default () => {
  const dispatch = useDispatch();
  const graphComments = useSelector(getGraphComments);
  const singleGraph = useSelector(getSingleGraph);

  useEffect(() => {
    dispatch(getGraphCommentsRequest({ graphId: singleGraph.id }));
  }, []);

  useEffect(() => {
    console.log(graphComments);
  }, [graphComments]);
  return null;
};
