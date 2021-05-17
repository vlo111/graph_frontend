import { useState, useEffect } from "react";
import { socketMousePosition } from '../../store/actions/socket';
import { useDispatch, useSelector } from 'react-redux';
import { getId } from '../../store/selectors/account';
import { getSingleGraph } from '../../store/selectors/graphs';


const MousePosition = ({props}) => {
  const [mousePosition, setMousePosition] = useState({ x: null, y: null });
  const dispatch = useDispatch();
  const userId = useSelector(getId);
  const singleGraph = useSelector(getSingleGraph);
  useEffect(
    () => {
      const update = (e) => {
        setMousePosition({ x: e.x, y: e.y });
       
      }
      window.addEventListener('mousemove', update)
      window.addEventListener('touchmove', update)
      return () => {
        window.removeEventListener('mousemove', update)
        window.removeEventListener('touchmove', update)
        
      }
    },
    [setMousePosition]
  )
  dispatch(socketMousePosition(singleGraph.id, userId, mousePosition));
  return setMousePosition;
};

export default MousePosition;