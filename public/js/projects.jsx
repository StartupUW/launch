var DEFAULT_SORT = 'top';
var DEFAULT_PAGE_LIMIT = 5;

var SORT_OPTIONS = {
    'top': function(a, b) { 
        var votes = this.state.votes;
        return (votes[b._id] || []).length - (votes[a._id] || []).length;
    },
    'new': function(a, b) { 
        var test = new Date(a.date) > new Date(b.date); 
        return test ? -1 : 1;
    }
}

var SortControl = React.createClass({
    getInitialState: function() {
        return {selected: DEFAULT_SORT};
    },
    handleClick: function(sort) {
        this.setState({selected: sort});
        $('#sort-method').val(sort).trigger('change');
    },
    getBtn: function(match) {
        return "btn" + (this.state.selected == match ? ' btn-primary': ' btn-default');
    },
    render: function() {
        return (
            <div>
                <p>SORT BY</p>
                <button onClick={this.handleClick.bind(this, 'new')} className={this.getBtn('new')}>New</button>
                <button onClick={this.handleClick.bind(this, 'top')} className={this.getBtn('top')}>Top</button>
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
        var srcUrl = this.props.src ? "/uploads/" + this.props.src : '/img/suw-logo.png';
        return (
            <div className="img-container col-sm-3 hidden-xs hidden-sm">
                <img className="project-logo" src={srcUrl}/>
            </div>
        );
    }
});

var VoteButton = React.createClass({
    getInitialState: function() {
        var user = this.props.user;
        var voted = false;
        if (user) {
            voted = this.props.votes.filter(function(el) {
                return el.user._id === user._id;
            }).length === 1;
        }
        return {
            numVotes: this.props.votes.length || 0,
            voted: voted
        };
    },
    componentDidMount: function() {
        $(".cannot-vote").tooltip({
            title: 'You must sign in to vote on projects!',
            placement: 'bottom'
        });
    },
    handleClick: function() {
        if (this.props.user) {
            $.get('/api/project/' + this.props.project._id + '/vote')
                .done(function(data) {
                    this.setState({
                        numVotes: this.state.numVotes + (data.voteStatus ? 1: -1),
                        voted: data.voteStatus
                    });
                }.bind(this))
        }
    },
    render: function() {
        var user = this.props.user;
        var numVotes = this.state.numVotes;
        var className = "votes";
        className += this.state.voted ? " user-voted" : " user-not-voted";
        className += user ? " can-vote" : " cannot-vote";

        return (
            <div onClick={this.handleClick} className={className}>
                <span className="glyphicon glyphicon-heart"></span>
                <span className="vote-count"> {numVotes > 0 ? numVotes : ""}</span>
            </div>
        );
    }
});

var ProjectInfo = React.createClass({
    getDate: function(date) {
        var diff = (new Date() - new Date(date)) / 60000;
        var interval = 'minute';
        if (diff > 60) {
            diff /= 60;
            interval = 'hour'
            if (diff > 24) {
                diff /= 24;
                interval = 'day';
            }
        }
        diff = parseInt(diff);
        return diff + ' ' + interval + (diff > 1 ? 's': '') + ' ago';
    },
    render: function() {
        var labelNodes = this.props.project.tags.map(function(tag) {
            return (<span key={tag} className="label label-default">{tag}</span>);
        });

        var diff = this.getDate(this.props.project.date);

        return (
            <div className="project-info col-xs-12">
                <h2 className="project-title"> {this.props.project.name}  
                    <div className="project-labels">
                        {labelNodes}
                    </div>
                </h2>
                <div className="posted">{diff}</div>
                <p className="project-description"> {this.props.project.description} </p>
                <a href={"/project/" + this.props.project._id}>
                    <div className="more"> SEE MORE </div>
                </a>
                <VoteButton key={this.props.id} {...this.props} />
            </div>
        );
    }
});

var Project = React.createClass({
    render: function() {
        var index = this.props.index;
        if (index % 2 == 0) {
            return (
                <d iv className="project col-md-12">
                    <ProjectImage url={''}></ProjectImage>
                    <ProjectInfo {...this.props}></ProjectInfo>
                </div>
            );
        } else {
            return (
                <div className="project col-md-12">
                    <ProjectInfo {...this.props} ></ProjectInfo>
                    <ProjectImage url={''}></ProjectImage>
                </div>
            );
        }
    }
});

var ProjectList = React.createClass({
    getInitialState: function() {
        return {
            votes: {}, projects: [], user: {}, filter: '',
            sort: DEFAULT_SORT, pageLimit: DEFAULT_PAGE_LIMIT, currentPage: 0
        };
    },
    componentDidMount: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({
                    projects: data.projects,
                    votes: data.votes,
                    user: data.user
                });

                $('#project-filter').keyup(this, function(event) {
                    event.data.setState({
                        currentPage: 0,
                        filter: $(this).val()
                    });
                });

                $('#sort-method').change(this, function(event) {
                    var sort = $(this).val();
                    event.data.setState({
                        sort: sort
                    });
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
        var projects = this.state.projects;
        var votes = this.state.votes;
        var user = this.state.user;
        var filter = this.state.filter.toLowerCase();
        var sort = this.state.sort;
        var pageLimit = this.state.pageLimit;
        var firstEl = this.state.currentPage * pageLimit;

        var projectNodes = projects
            .filter(function(project) {
                return !filter || project.name.toLowerCase().indexOf(filter) != -1 ||
                    project.description.toLowerCase().indexOf(filter) != -1 ||
                    project.tags.join(' ').toLowerCase().indexOf(filter) != -1;
            })

        var totalLength = projectNodes.length;
        
        projectNodes.sort(SORT_OPTIONS[sort].bind(this))

        projectNodes = projectNodes
            .map(function(project, index) {
                var votes = this.state.votes[project._id] || [];
                return (
                    <div className="project col-xs-12">
                        <ProjectImage src={project.images[0]}></ProjectImage>
                        <ProjectInfo key={project._id} project={project} votes={votes} user={user}></ProjectInfo>
                    </div>
                );
            }.bind(this))
            .slice(firstEl, firstEl + pageLimit);

        var pageNodes = [];

        for (var i = 0; i < totalLength / pageLimit; i++) {
            var className = i == this.state.currentPage ? "active": "";
            pageNodes.push(
                (<li key={i} className={className} onClick={this.handleClick.bind(this, i)}>
                    <a href="#!"> {i + 1} </a>
                </li>)
            );
        }

        if (projectNodes.length > 0) {
            return (
                <div>
                    {projectNodes}
                    <nav>
                        <ul className="pagination"> {pageNodes}
                            <span className="pagination-showing">Showing {firstEl + 1} - {firstEl + projectNodes.length} of {totalLength}</span>
                        </ul>
                    </nav>
                </div>
            );
        } 
        return (<div><h1>No projects found</h1></div>);
    }
});

 

