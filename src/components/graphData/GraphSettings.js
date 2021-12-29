import React, {
  useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import EditGraphModal from '../chart/EditGraphModal';
import { ReactComponent as EditSvg } from '../../assets/images/icons/edit.svg';
import Button from '../form/Button';
import Input from '../form/Input';
import SaveAsTampletModal from '../chart/SaveasTampletModal';
import Api from '../../Api';
import ChartUtils from '../../helpers/ChartUtils';
import { setActiveButton, setLoading } from '../../store/actions/app';
import Chart from '../../Chart';

const GraphSettings = ({ singleGraph }) => {
  const [openEditGraphModal, setOpenEditGraphModal] = useState(false);
  const [openSaveAsTempletModal, setOpenSaveAsTempletModal] = useState(false);
  const ref = useRef();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isTemplate = singleGraph.status === 'template';
  const graphId = singleGraph.id;
  const [search, setSearch] = useState('');
  const [graphList, setGraphList] = useState([]);
  const [requestData, setRequestData] = useState({
    title: singleGraph.title,
    description: singleGraph.description,
    status: 'active',
    publicState: false,
    userImage: false,
  });
  const history = useHistory();

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (isMenuOpen && ref.current && !ref.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('click', checkIfClickedOutside);
    return () => {
      document.removeEventListener('click', checkIfClickedOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setRequestData({
      title: singleGraph.title,
      description: singleGraph.description,
      status: 'active',
      publicState: false,
      userImage: false,
    });
  }, [singleGraph]);

  const startGraph = () => {
    window.location.href = '/graphs/create';
  };

  const handleSearch = async (value) => {
    setGraphList([]);
    setSearch(value);
    if (!value) {
      return;
    }
    const result = await Api.getGraphsList(1, {
      onlyTitle: true,
      s: search,
      limit: search === '' ? 3 : undefined,
      graphName: 'true',
      graphId,
    });
    setGraphList(result?.data?.graphs || []);
  };

  useEffect(async () => {
    if (isMenuOpen) {
      setGraphList([]);
      const result = await Api.getGraphsList(1, {
        onlyTitle: true,
        s: search,
        limit: search === '' ? 3 : undefined,
        graphName: 'true',
        graphId,
      });
      setGraphList(result?.data?.graphs || []);
      Chart.undoManager.reset();
    }
  }, [graphId, isMenuOpen]);

  const saveGraph = async (status, forceCreate) => {
    const labels = Chart.getLabels();
    const svg = ChartUtils.getChartSvg();
    let resGraphId;
    if (forceCreate || !graphId) {
      const result = await Api.createGraph({
        ...requestData,
        status,
        svg,
        graphId,
      });
      resGraphId = result.data.graphId;
    } else {
      const result = await Api.updateGraph({
        ...requestData,
        labels,
        status,
        svg,
      });
      resGraphId = result.data.graphId;
    }
    if (resGraphId) {
      toast.info('Successfully saved');
      history.push('/');
    } else {
      toast.error('Something went wrong. Please try again');
    }

    setLoading(false);
    setIsMenuOpen();
    setActiveButton('create');
  };

  const handleChange = async (path, value) => {
    setRequestData((prevState) => ({
      ...prevState,
      [path]: value,
    }));
  };

  return (
    <div className="GraphNames">
      <button
        className="dropdown-btn"
        type="button"
        onClick={() => setIsMenuOpen(true)}
      >
        <div className="graphNname">
          <span title={singleGraph.title} className="graphNames">
            {singleGraph.title?.length > 11 ? `${singleGraph.title.substring(0, 11)}...` : singleGraph.title}
          </span>
          <span className="carret2">
            <i className="fa fa-sort-down" />
          </span>
        </div>
      </button>
      {isMenuOpen && (
      <div ref={ref} className="dropdown">
        <div className="graphname">
          <span title={singleGraph.title} className="graphNames">
            {singleGraph.title.length > 11 ? `${singleGraph.title.substring(0, 11)}...` : singleGraph.title}
          </span>
          <Button
            icon={<EditSvg />}
            className="EditGraph"
            onClick={() => setOpenEditGraphModal(true)}
          />
        </div>
        <div>
          <Input
            className="graphSearchName"
            placeholder="Search"
            icon="fa-search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="graphNameList">
          {graphList && graphList.map((graph) => (
            <Link to={`/graphs/update/${graph.id}`} onClick={() => setIsMenuOpen(false)}>
              <div title={graph.title}>
                {graph.title.length > 11 ? `${graph.title.substring(0, 11)}...` : graph.title}
              </div>
            </Link>
          ))}
        </div>
        <Button
          className="btn-classic"
          onClick={startGraph}
          style={{ fontSize: 18 }}
        >
          New Graph
        </Button>

        {isTemplate ? (
          <>
            <Button
              className="accent alt"
              onClick={() => saveGraph('active', true)}
            >
              Save as Graph
            </Button>
          </>
        ) : (
          <Button
            className="btn-delete"
            onClick={() => setOpenSaveAsTempletModal(true)}
          >
            Save as Template
          </Button>
        )}

      </div>
      )}
      {openEditGraphModal && (
        <EditGraphModal
          toggleModal={(value) => setOpenEditGraphModal(value)}
          graph={singleGraph}
        />
      )}
      {openSaveAsTempletModal && (
        <SaveAsTampletModal
          toggleModal={(value) => setOpenSaveAsTempletModal(value)}
          saveGraph={saveGraph}
          handleChange={handleChange}
          requestData={requestData}
        />
      )}
    </div>
  );
};

GraphSettings.propTypes = {
  singleGraph: PropTypes.object.isRequired,
};

export default React.memo(GraphSettings);
