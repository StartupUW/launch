var DEFAULT_SORT = 'top';

var changeSort = function(sort) {
    return function() {
        this.setState({selected: sort});
        $('#sort-method').val(sort).trigger('change');
    }
}

var SortControl = React.createClass({
    getInitialState: function() {
        return {selected: DEFAULT_SORT};
    },
    newClick: changeSort('new'),
    topClick: changeSort('top'),
    render: function() {
        var selected = this.state.selected;

        var getBtn = function(match) {
            return "btn" + (selected == match ? ' btn-primary': ' btn-default');
        }

        var newClassName  = getBtn('new');
        var topClassName = getBtn('top');
        return (
            <div>
                <p>SORT BY</p>
                <button onClick={this.newClick} className={newClassName}>New</button>
                <button onClick={this.topClick} className={topClassName}>Top</button>
                <input id="sort-method" type="hidden" />
            </div>
        );
    }
});

React.render(
    <SortControl />,
    document.getElementById('sort')
);

var ProjectImage = React.createClass({
    render: function() {
        var srcUrl = this.props.src ? this.props.src : '/img/suw-logo.png';
        return (
            <div className="img-container col-sm-3 hidden-xs">
                <img className="project-logo" src={srcUrl} />
            </div>
        );
    }
});

var VoteButton = React.createClass({
    getInitialState: function() {
        var loggedIn = this.props.user != null;
        var userId = loggedIn ? this.props.user.id : -1;
        var voted = this.props.votes.filter(function(el) {
            return el.uid === userId;
        }).length === 1;
        return { canVote: loggedIn, voted: voted, numVotes: this.props.votes.length };
    },
    componentDidMount: function() {
        $(".cannot-vote").tooltip({title: 'You must sign in to vote on projects!', placement: 'bottom'});
    },
    handleClick: function(event) {
        if (this.state.canVote) {
            var reactButton = this;
            $.get('/project/' + this.props.id + '/vote')
                .done(function(data) {
                    var voteStatus = data.voteStatus;
                    reactButton.setState({voted: data.voteStatus, numVotes: data.votes});
                })
                .fail(function(data) {
                    var data = JSON.parse(data.responseText);
                    console.log(data.err);    
                });
        }
    },
    render: function() {
        var numVotes = this.state.numVotes;
        var className = "votes";
        className += this.state.voted ? " user-voted" : " user-not-voted";
        className += this.state.canVote ? " can-vote" : " cannot-vote";
        return (
            <div onClick={this.handleClick} className={className} id={this.props.id}>
                <span className="glyphicon glyphicon-heart"></span>
                <span className="vote-count"> {numVotes > 0 ? numVotes : ""}</span>
            </div>
        );
    }
});

var ProjectInfo = React.createClass({
    render: function() {
        var labelNodes = this.props.project.tags.map(function(tag) {
            return (<span key={tag} className="label label-default">{tag}</span>);
        });

        var memberNodes = this.props.project.contact.map(function(member) {
            return (<span key={member} className="member">{member}</span>);
        });

        var id = this.props.project._id;
        var projectUrl = "/project/" + id;
        var votes = this.props.project.votes;

        return (
            <div className="project-info col-sm-9">
                <h2 className="project-title"> {this.props.project.name} 
                    <div className="project-labels">
                        {labelNodes}
                    </div>
                </h2>
                <div className="project-members">
                    {memberNodes}
                </div>
                <p className="project-description"> {this.props.project.description} </p>
                <a href={projectUrl}>
                    <div className="more"> SEE MORE </div>
                </a>
                <VoteButton key={id} id={id} user={this.props.user} votes={this.props.project.votes} />
            </div>
        );
    }
});

var Project = React.createClass({
    render: function() {
        var index = this.props.index;
        if (index % 2 == 0) {
            return (
                <div className="project col-md-12">
                    <ProjectImage url={''}></ProjectImage>
                    <ProjectInfo user={this.props.user} project={this.props.project}></ProjectInfo>
                </div>
            );
        } else {
            return (
                <div className="project col-md-12">
                    <ProjectInfo user={this.props.user} project={this.props.project}></ProjectInfo>
                    <ProjectImage url={''}></ProjectImage>
                </div>
            );
        }
    }
});

var ProjectList = React.createClass({
    getInitialState: function() {
        return {
            projects: [], user: {}, filter: '',
            sort: DEFAULT_SORT, pageLimit: 1, currentPage: 0
        };
    },
    componentDidMount: function() {
        var topSort = function(a, b) { return b.votes.length - a.votes.length; };
        var newSort = function(a, b) { 
            var test = new Date(a.date) < new Date(b.date); 
            return test ? -1 : 1;
        };
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({projects: data.projects.sort(topSort), user: data.user});
                $('#project-filter').keyup(this, function(event) {
                    event.data.setState({currentPage: 0, filter: $(this).val()});
                });
                $('#sort-method').change(this, function(event) {
                    var sort = $(this).val();
                    var sortProjects = function(a, b) {
                        switch(sort) {
                            case 'new': return newSort(a, b);
                            case 'top': return topSort(a, b);
                        }
                        return -1;
                    };
                    event.data.setState({sort: sort,  projects: event.data.state.projects.sort(sortProjects) });
                });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleClick: function(i) {
        this.setState({currentPage: i});
    },
    render: function() {
        var user = this.state.user;
        var filter = this.state.filter.toLowerCase();
        var sort = this.state.sort;
        var pageLimit = this.state.pageLimit;
        var firstEl = this.state.currentPage * pageLimit;

        // Filter out projects that match the search bar, then sort
        // by sorting option, then finally cut by page size.
        var projectNodes = this.state.projects.filter(function(project) {
            return !filter || project.name.toLowerCase().indexOf(filter) != -1 ||
                project.description.toLowerCase().indexOf(filter) != -1 ||
                project.tags.join(' ').toLowerCase().indexOf(filter) != -1;
        }).map(function(project, index) {
            return (<Project key={project._id} project={project} index={index % pageLimit} user={user} />);
        });
        
        var totalLength = projectNodes.length;
        projectNodes = projectNodes.slice(firstEl, firstEl + pageLimit);

        var pageNodes = [];
        for (var i = 0; i < totalLength / pageLimit; i++) {
            var className = i == this.state.currentPage ? "active": "";
            pageNodes.push(
                (<li className={className} onClick={this.handleClick.bind(this, i)}>
                    <a href="#"> {i + 1} </a>
                </li>)
            );
        }

        if (projectNodes.length > 0) {
            return (
                <div>
                    {projectNodes}
                    <nav>
                        <ul className="pagination">
                            {pageNodes}
                            <span className="pagination-showing">Showing {firstEl + 1} of {totalLength}</span>
                        </ul>
                    </nav>
                </div>
            );
        } 
        return (<div><h1>No projects found</h1></div>);
    }
});

React.render(
    <ProjectList url="/projects" />,
    document.getElementById('projects-container')
);


