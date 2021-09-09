import React from 'react';
import {
  Tab, Tabs, TabList, TabPanel,
} from 'react-tabs';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';
import 'react-tabs/style/react-tabs.css';
import HelpSvg from '../../assets/images/Help.svg';
import liinkSvg from '../../assets/images/liink.svg';
import HelpLeftSvg from '../../assets/images/helpleft.svg';

export default (props) => {
  const handleClose = () => {
    props.closeModal();
  };

  return (
    <div className="help">
      <Tabs>
        <div>
        <Button
          color="transparent"
          className="btn-close "
          icon={<CloseSvg />}
          onClick={handleClose}
        />
        </div>
        <div className="triangle-right" />
        <div className="helpName">
        <TabList>
          <h1>Help</h1>
           <Tab><h4 className="helpTitlePages">Create  graph</h4></Tab>
           <h3 className="helpTitle">Create Node</h3>
          <Tab><li>New node</li></Tab>
          <Tab>Create node via Google map</Tab>
          <Tab>Create node via Wikipedia</Tab>
          <Tab>Create node by Linkedin </Tab>
          <Tab>Create node by Science Mind </Tab>
          <Tab>Find Node</Tab>
        <Tab> <h4 className="helpTitlePages">link the nodes</h4></Tab>
        <h3 className="helpTitle">lables and Folders</h3>
          <Tab> Create Label</Tab>
          <Tab> Craete Folder</Tab>
       <h3 className="helpTitle">Import/Export</h3>
          <Tab>Import a graph</Tab>
          <Tab>Export a graph</Tab>
      <h3 className="helpTitle">Compare</h3>
          <Tab>Compare graphs </Tab>
         <Tab>Compare nodes of a Label/Folder</Tab> 
      <h3 className="helpTitle">Share</h3>
          <Tab>Share a graph </Tab>
          <Tab>Share label and folder </Tab>
      <h3 className="helpTitle">Search</h3>
            <Tab>More options of nodes</Tab> 
          <Tab>Search</Tab>
          <Tab><h4 className="helpTitlePages">Filter</h4></Tab>
           <Tab><h4 className="helpTitlePages">Media</h4></Tab> 
          <Tab><h4 className="helpTitlePages">Analysis</h4></Tab> 
          <Tab><h4 className="helpTitlePages">Shotcuts</h4></Tab> 
        </TabList>
        </div>
        <div className="color-border" />
        <TabPanel>
          <div>
            {' '}
            {/* <img src={HelpSvg} className="help_img" /> */}
            <iframe className="help_img" src="https://www.youtube.com/embed/8aJt88yJ8eY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
          <div>
            <p>Create a graph</p>
          </div>
          <div className="help_text">
            <ol>
              <li>Start a graph</li>
              <li>Write the title of the graph</li>
              <li>Write a short description of what you are going to create</li>
              <li>Create</li>
              <li>Open graph options from the top</li>
              <li>See the last 3 graphs you have working on, for quick access click on one of the graphs</li>
              <li>Search a graph by the name</li>
              <li>Create a new graph</li>
              <li>Save existing graph as a template</li>
              <li>Click on edit pen</li>
              <li>Upload a cover photo for your graph</li>
              <li>View the owner’s name, creation date and the last modification date of the graph</li>
              <li>Edit or add a description</li>
              <li>Press save to fix the the modifications done in this window</li>
              <li>Press delete to remove the whole graph</li>
              <p className="help_graph_text">(close the graph)</p>
              <p className="help_graph_text">(click on ...)</p>
            </ol>
          </div>
          <div className="help_text">
            <ol>
              <li>change the name of the graph</li>
              <li>
                share the graph with other users (view details in the video « <b>Share a graph</b> »)
              </li>
              <li>delete the whole graph</li>
            </ol>
          </div>

        </TabPanel>
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Create new nodes</p>
          
          </div>
          <div className="help_text">
            <ol>
              <li>Right-click anywhere on the canvas or Create a node</li>
              <li>Choose Create node</li>
              <li>
                Enter the node type (Person, organization, place, event, etc.)
              </li>
              <li>Enter the proper name of the node</li>
              <li>Select the status of the node</li>
              <li>Choose or upload an icon to your node</li>
              <li>Adjust the color of the node</li>
              <li>Write some descriptive keywords</li>
              <li>Set the visual size of the node</li>
              <li>Select a location on the Google map</li>
              <li>Press Add</li>
            </ol>
          </div>
        </TabPanel>
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Create node via Google map</p>
           
          </div>
          <div className="help_text">
            <ol>
              <li>Click on Create Node ➜ Use Google map</li>
              <li>Search any place</li>
              <li>Click on the Google map location icon</li>
              <li>
                Fill in more options (Status , icon shape, color, keywords, size )
              </li>
              <li>Press Add</li>
              <li>Double click on the node</li>
              <li>
                View user’s Info, write Comments, Export in PDF form, and Edit the
                node
              </li>
              <li>
                You have full information in About and you can view the location
                on Google Map
                {' '}
              </li>
              <li>
                Click on Add New Tab (+) and enter the information you want (text,
                photo, video, etc.)
              </li>
            </ol>
          </div>
        </TabPanel>
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Create node via Wikipedia</p>
           
          </div>
          <div className="help_text">
            <ol>
              <li>Click on Create Node ➜ Use Wikipedia</li>
              <li>Search any information</li>
              <li>Choose an article from the list</li>
              <li>Press Create Node</li>
              <li>
                Fill in the more options (Status , icon shape, color, keywords,
                size )
              </li>
              <li>Press Add</li>
              <li>Double click on the node</li>
              <li>
                View user’s Info, write Comments, Export in PDF form, and Edit the
                node
              </li>
              <li>You have full information in About</li>
              <li>
                Click on Add New Tab (+) and enter the information you want (text,
                photo, video, etc.)
              </li>
            </ol>
          </div>
        </TabPanel>
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Create node via Linkedin</p>
          
          </div>
          <div className="help_text">
            <ol>
              <li>Click on Create Node ➜ Use Linkedin</li>
              <li>Select the Linkedin profile file (PDF) from your PC</li>
              <li>Press Import</li>
              <li>
                Fill in the more options (Status , icon shape, color, keywords,
                size )
              </li>
              <li>Press Add</li>
              <li>Double click on the node</li>
              <li>
                View user’s Info, write Comments, Export in PDF form, and Edit the
                node
              </li>
              <li>
                You have the sections Experience, Education, Skills… mentioned in
                Linkedin profile
              </li>
              <li>
                Click on Add New Tab (+) and enter the information you want (text,
                photo, video, etc.).
              </li>
            </ol>
          </div>
        </TabPanel>
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Create node by Science Mind </p>
           
          </div>
          <div className="helpMindText">
            <p>What is Mind Science? </p>
            <span>
              Science Mind is a huge base of three famous scientific sites:
              {' '}
            </span>
            <a href="www.core.ac.uk">
              {' '}
              <img src={HelpLeftSvg} />
              {' '}
              www.core.ac.uk
            </a>
            <a href="www.semanticscholar.org">
              {' '}
              <img src={HelpLeftSvg} />
              {' '}
              www.semanticscholar.org
            </a>
            <a href="www.arxiv.org">
              {' '}
              <img src={HelpLeftSvg} />
              {' '}
              www.arxiv.org
            </a>
          </div>
          <div className="help_text">
            <ol>
              <li>Click on Create Node ➜ Use Science Mind</li>
              <li>Search the Authors or Articles</li>
              <li>Choose one or more articles from the list,</li>
              <li>Press Create Subgraph</li>
              <li>Double click on one of the nodes</li>
              <li>
                View user’s Info, write Comments, Export in PDF form, and Edit the
                node
              </li>
              <li>You have full information in About</li>
              <li>
                Click on Add New Tab (+) and enter the information you want (text,
                photo, video, etc.).
              </li>
            </ol>
          </div>
        </TabPanel>
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Find node</p>
          
          </div>
          <div className="help_text">
            <ol>
              <li>
                Search node by the title in all my graphs and in shared graphs
              </li>
              <li>
                Move the finded node into the opened graph and choose one of the
                options
              </li>
            </ol>
          </div>
        </TabPanel>
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Link the nodes</p>
           
          </div>
          <div className="help_text">
            <ol>
              <li>Click on one of the nodes</li>
              <li>Then, click on another node</li>
              <li>Select the Status of the link</li>
              <li>Choose the Link type</li>
              <li>Type the Relation Type</li>
              <li>Give a Value to this link</li>
              <li>
                Select Show Direction to display the dependence of a node from the
                other
                {' '}
              </li>
              <li>Press Add</li>
              <li>
                You can have multiple links between two nodes (up to 200 links)
              </li>
            </ol>
          </div>
        </TabPanel>
       
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <div>
              <p>Label</p>
             
            </div>
            <div className="help_text">
              <p>A</p>
              <ol>
                <li>Click on Create New ➜ Label ➜ Free form</li>
                <li>
                  Use the pencil to draw a Label on nodes or anywhere on the canvas
                  {' '}
                </li>
                <li>Type the Name of the Label</li>
                <li>Press Add</li>
                <li>
                  Move into the Label existing nodes or create the new ones in.
                </li>
              </ol>
            </div>
            <div className="help_text">
              <p>B</p>
              <ol>
                <li>
                  lick on Create New ➜ Label ➜ choose square or ellipse form of
                  Label
                </li>
                <li>
                  Draw a square or ellipse on nodes or anywhere on the canvas
                  {' '}
                </li>
                <li>
                  Move into the Label existing nodes or create the new ones in.
                </li>
              </ol>
            </div>
            <div className="help_label-text">
              <p>Right-click on the Label...</p>
              <li>Edit the name of Label</li>
              <li>Copy and paste the Label anywhere on the canvas</li>
              <li>
                Lock/unlock the Label: Locked Labels are not shown to the persons
                with shared access
              </li>
              <li>
                Share Label with Collaborators who have Araks profile. Search
                collaborators by user name and work with them simultaneously on the
                shared Label.
              </li>
              <p>Collaborators with «View» access can</p>
              <li>View only shared Label</li>
              <li>Write comments</li>
              <p>Collaborators with «Edit» access can</p>
              <li>View only shared Label</li>
              <li>Create/edit nodes, links only in shared Label</li>
              <li>Move nodes outside the Label</li>
              <p>Collaborators with «Edit inside» access can</p>
              <li>View shared Label</li>
              <li>Create/edit nodes, links only in shared Label</li>
              <p>Collaborators with «Audit» access can </p>
              <li>
                {' '}
                View the shared Label, change the status of nodes and write comments
              </li>
              <li> Create node especially in this Label</li>
              <li> Paste append: paste the Label you have copied.</li>
              <li> Paste embedded: Paste the Label as a photo.</li>
              <li> Delete the Label</li>
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Folder</p>
          
          </div>
          <div className="help_text">
            <ol>
              <li>Create New ➜Folder</li>
              <li>Click anywhere on canvas</li>
              <li>Type the name of the Folder</li>
              <li>Press Add</li>
              <li>Open your Folder by double click</li>
              <li>
                Move into the Folder existing nodes or create the new ones in
              </li>
            </ol>
          </div>

          <div className="help_label-text">
            <p>Right-click on the Folder.</p>
            <li>Edit the name of Folder</li>
            <li>Copy and paste the Folder anywhere on the canvas</li>
            <li>
              Lock/unlock the Folder: Locked Folder is not shown to the
              Collaborators with shared access
            </li>
            <li>
              Share Folder with Collaborators who have Araks profile. Search
              collaborators by user name and work with them simultaneously on
              shared Folder.
            </li>
            <p>Collaborators with «View» access can</p>
            <li>View only shared Folder</li>
            <p>Collaborators with «Edit» access can</p>
            <li>View only shared Folders</li>
            <li>Create/edit nodes, links, labels only in shared Folder</li>
            <li>Move nodes outside the Folder</li>

            <p>Collaborators with «Edit inside» access can</p>
            <li>View shared Folders</li>
            <li>Create/edit nodes, links, labels only in shared Folder</li>

            <p>Collaborators with «Audit» access can </p>
            <li>
              View shared Folder, change the status of nodes and write comments
            </li>
            <li>Create nodes especially in this Folder</li>
            <li>Paste append: paste the Folder you have copied.</li>
            <li>Paste embedded: Paste the Folder as a photo.</li>
            <li>Delete the Folder</li>
          </div>
        </TabPanel>




        
        <TabPanel>

          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Import a graph</p>
           
          </div>
          <div className="help_text">
            <ol>
              <li>Start a graph</li>
              <li>Write the title of your graph</li>
              <li>Write a short description of what you are going to create</li>
              <li>Create</li>
              <li>Click on Import Data</li>
              <li>Choose Import Data file type</li>
              <li>Select the file from your PC</li>
              <li>Press Next</li>
              <li>Press Import</li>
              <li>Type the title of the graph</li>
              <li>Type a short description</li>
              <li>Save the graph</li>

            </ol>
          </div>

        </TabPanel>
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>
              Export a graph
            </p>
          
          </div>
          <div className="help_text">
            <p className="marg_graph_text">
              The Data sheet is the detailed summary of your graph.
              <br />
              {' '}
              Here you can find all listed information about:
            </p>
            <a href="www.core.ac.uk">
              {' '}
              <img src={HelpLeftSvg} />
              {' '}
              www.core.ac.uk
            </a>
            <a href="www.semanticscholar.org">
              {' '}
              <img src={HelpLeftSvg} />
              {' '}
              www.semanticscholar.org
            </a>
          </div>
          <div className="help_text">
            <p className="export_graph_text">
              You have an opportunity to EXPORT the graph in the
              <br />
              {' '}
              following formats:
            </p>
            {' '}
            <div className="export_help_text">
              <a>

                <img src={HelpLeftSvg} />
                ZIP (use this format to fully backup the graph)
              </a>
              <a>
                {' '}
                <img src={HelpLeftSvg} />
                {' '}
                PNG
              </a>
              <a>
                {' '}
                <img src={HelpLeftSvg} />
                {' '}
                PDF
              </a>
              <a>
                {' '}
                <img src={HelpLeftSvg} />
                {' '}
                Excel (.xlsx)
              </a>

            </div>
          </div>
        </TabPanel>
   
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>
              Compare and merge graphs
            </p>
           
          </div>
          <div className="help_text">
            <p className="marg_graph_text">You can compare two graphs and find similar nodes:</p>
            <ol>
              <li>Click on Compare graphs</li>
              <li>Select the 1st graph</li>
              <li>Select the 2nd graph</li>
              <li>
                The system will automatically compare the graphs and show all similar and different nodes with their
                quantities.
              </li>
            </ol>
            <p className="help_node_text">
              If you want marge these 2 graphs and make a new graph
              <br />
              {' '}
              with similar and different nodes

            </p>
          </div>
          <div className="help_text">
            <ol>
              <li>Click on Create New Graph</li>
              <li>Type the title of your new graph</li>
              <li>Type a short description of what you are going to create</li>
              <li>Create</li>

            </ol>
          </div>
        </TabPanel>
<TabPanel> Compare nodes of a Label/Folder
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>
              Compare nodes of a Label/Folder
              {' '}
              <br />
              {' '}
              with the nodes of another
              graph
            </p>
          
          </div>
          <div className="help_text">
            <ol>
              <li>Right-click on the Label/Folder of 1st graph</li>
              <li>Copy</li>
              <li>Open the 2nd graph</li>
              <li>Right-click anywhere on the canvas</li>
              <li>Past append</li>
              <li>Compare nodes,</li>
              <li>Merge nodes,</li>
              <li>Skip these nodes,</li>
              <li>Replace the nodes in the destination,</li>
              <li>Keep both.</li>
            </ol>
            <p className="help_node_text">
              If you want to view the Label/Folder of the 1st graph as a PHOTO
              {' '}
              <br />
              in the 2nd graph but NOT compare their nodes:
              {' '}
            </p>
          </div>
          <div className="help_text">
            <ol>
              <li>Right-click on the Label/Folder of the 1st graph</li>
              <li>Copy</li>
              <li>Open the 2nd graph</li>
              <li>Right-click anywhere on the canvas</li>
              <li>Past embedded</li>
            </ol>
          </div>
        </TabPanel>


        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Share a graph </p>
          
          </div>
          <div className="help_text">
            <ol>
              <li>Press on 3 points ➜ Share OR Open the graph</li>
              <li>Press on Share</li>
              <li>Search a user</li>
              <li>Give access to the graph `</li>
            </ol>
          </div>
          <div className="help_label-text">
            <p>Collaborators with «View» access can</p>
            <li>View the graph,</li>
            <li>Write comments.</li>

            <p>Collaborators with «Edit» access can</p>
            <li>create nodes, links, labels, etc.,</li>
            <li>comment on the graphs and nodes,</li>
            <li>delete the shared graph only from their account, but not the main graph.</li>

            <p>Collaborators with «Admin» access can</p>
            <li>Create nodes, links, labels, etc.,</li>
            <li>Comment on the graphs and nodes,</li>
            <li>Delete the graph</li>
            <li>Share the graph.</li>
            <li>Press Save.</li>
          </div>
          <div className="help_text">
            <ol>
              <li>View the collaborators you are sharing the graph with.</li>
              <li>
                Press on the blue cursor to see the cursors of collaborators, who is working on which part of the
                graph.
              </li>

            </ol>
          </div>

        </TabPanel>
        <TabPanel>
        <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Share a Label and Folder </p>
          
          </div>
          <div className="help_text">
            <ol>
              <li>Right-click on the Label/ Folder ➜ Share</li>
              <li>Search a user  </li>
              <li>Give access to the graph</li>
            </ol>
          </div>
          <div className="help_label-text">
            <p>Collaborators with «View» access can</p>
            <li>View only shared Label</li>
            <li>Write comments.</li>

            <p>Collaborators with «Edit» access can</p>
            <li>View only shared Label</li>
            <li>Create/edit nodes, links only in shared Label</li>
            <li>Move nodes outside the label</li>

            <p>Collaborators with «Edit inside» access can</p>
            <li>View shared Label</li>
            <li>Create/edit nodes, links only in shared Label</li>

            <p>Collaborators with «Audit» access can</p>
            <li>View the shared Label, change the status of nodes and write comments</li>
            <li>Create node especially in this Label</li>
            <li>Paste append: paste all information you have copied. Paste embedded: Paste a label as a photo.</li>
            <li>Delete the Label</li>
            <li>Show on the Google Map if in the Label you have nodes mentioned on Google Map</li>
            <li>Undo the last action done in the Label.</li>
          </div>
          
        </TabPanel>
         <TabPanel>  
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>More options of nodes</p>
          
          </div>
          <div className="help_text">
            <ol>
              <li>Edit or complete any option of the node</li>
              <li>
                Find path: Using Dijkstra's algorithm the program finds the
                shortest way to another node.
                {' '}
              </li>
              <li>Delete the node</li>
              <li>
                Show on Google map if in the options of the node you have
                mentioned a location.
              </li>
            </ol>
          </div>
        </TabPanel>
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>
              Search
            </p>
           
          </div>

          <div className="help_text">
            <p className="export_graph_text"> Search any information in the current graph using filters.</p>
            <p className="export_graph_text"> More filters.</p>

          </div>
        </TabPanel>
        <TabPanel>

          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>Filter </p>
            
          </div>
          <div className="help_text">
            <ol>
              <li>Click on the Filter</li>
              <li>Filter the data by:</li>

            </ol>
          </div>
          <div className="helpMindText">
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Node types
            </a>
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Node status
            </a>
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Labels
            </a>
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Label status,
            </a>
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Node Connections values
            </a>
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Node Keywords
            </a>

          </div>
        </TabPanel>
    <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>
              Media
            </p>
           
          </div>
          <div className="help_text">
            <p className="marg_graph_text">
              All media information (photos, videos, etc.) that you have in
              <br />
              {' '}
              nodes, appears in the Media gallery.
            </p>
            <ol>
              <li>Click on the media</li>
              <li>View the information by:</li>

            </ol>
          </div>
          <div className="helpMindText">
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Node icon
            </a>
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Show documents of tabs
            </a>
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Show image of tabs
            </a>
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Videos
            </a>

          </div>

        </TabPanel> 
        <TabPanel>
          <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
          <div>
            <p>
              Analysis
            </p>
          
          </div>
          <div className="help_text">
            <p className="marg_graph_text">In the analysis section, we calculate the parameters listed below:</p>
            <ol>
              <li>Components of the graph</li>
              <li>Analytics of the node:</li>

            </ol>
          </div>
          <div className="helpMindText">
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Node icon
            </a>
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Show documents of tabs
            </a>
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Show image of tabs
            </a>
            <a>
              {' '}
              <img src={HelpLeftSvg} />
              Videos
            </a>

          </div>
          <div className="help_text">
            <ol>
              <li>Multiplicity of edges (number of multiple edges between each pair of nodes)</li>
              <li>Number of connected components</li>
              <li>Sizes of connected components</li>
              <li>Min and max degrees</li>
              <li>Mean degree</li>
              <li>Degree distribution of the network</li>
              <li>Clustering coefficient</li>
              <li>Adjacent nodes</li>
              <li>Incident edges</li>
              <li>Degree of a node</li>
              <li>In- and out-degrees of nodes</li>
              <li>Local clustering coefficients of nodes</li>

            </ol>
          </div>
        </TabPanel> 
        <TabPanel>
          
        <div>
            {' '}
            <img src={HelpSvg} className="help_img" />
          </div>
         
        <div className="help-text">
              <ul>
                <li>
                   <span className="HelpCommand">Analysis</span>
                   <div>
                        <span>Ctrl</span>
                        <span>A</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Import</span>
                   <div>
                        <span>Ctrl</span>
                        <span>I</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Data</span>
                   <div>
                        <span>Ctrl</span>
                        <span>D</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Search</span>
                   <div>
                        <span>Ctrl</span>
                        <span>F</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Media</span>
                   <div>
                        <span>Ctrl</span>
                        <span>M</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Science Graph</span>
                   <div>
                        <span>Ctrl</span>
                        <span>G</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Pencil</span>
                   <div>
                        <span>Ctrl</span>
                        <span>P</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Pencile Label</span>
                   <div>
                        <span>Ctrl</span>
                        <span>L</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Pencile ellipse label</span>
                   <div>
                        <span>Ctrl</span>
                        <span>E</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Pencilesquare label</span>
                   <div>
                        <span>Shift </span>
                        <span>E</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Edit Node</span>
                   <div>
                        <span>Ctrl</span>
                        <span>E</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">To open selected node</span>
                   <div>
                        <span>Enter</span>
                       
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">To escape selected item</span>
                   <div>
                        <span>Esc</span>
                      
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Select Dashboard</span>
                   <div>
                        <span>Shift</span>
                        <span>D</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Copy</span>
                   <div>
                        <span>Ctrl</span>
                        <span>C</span>
                   </div>
                </li>
                <li>
                   <span className="HelpCommand">Past</span>
                   <div>
                        <span>Ctrl</span>
                        <span>V</span>
                   </div>
                </li>
              </ul>
            </div>
       
        </TabPanel>

      </Tabs>
    </div>
  );
};
