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

var SortControl = React.createClass({displayName: "SortControl",
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
            React.createElement("div", null, 
                React.createElement("p", null, "SORT BY"), 
                React.createElement("button", {onClick: this.handleClick.bind(this, 'new'), className: this.getBtn('new')}, "New"), 
                React.createElement("button", {onClick: this.handleClick.bind(this, 'top'), className: this.getBtn('top')}, "Top"), 
                React.createElement("input", {id: "sort-method", type: "hidden"})
            )
        );
    }
});

ReactDOM.render(
    React.createElement(SortControl, null),
    document.getElementById('sort')
);

var ProjectImage = React.createClass({displayName: "ProjectImage",
    render: function() {
        var srcUrl = this.props.src ? "/uploads/" + this.props.src : '/img/suw-logo.png';
        return (
            React.createElement("div", {className: "img-container col-sm-3 hidden-xs hidden-sm"}, 
                React.createElement("img", {className: "project-logo", src: srcUrl})
            )
        );
    }
});

var VoteButton = React.createClass({displayName: "VoteButton",
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
            React.createElement("div", {onClick: this.handleClick, className: className}, 
                React.createElement("span", {className: "glyphicon glyphicon-heart"}), 
                React.createElement("span", {className: "vote-count"}, " ", numVotes > 0 ? numVotes : "")
            )
        );
    }
});

var ProjectInfo = React.createClass({displayName: "ProjectInfo",
    render: function() {
        var labelNodes = this.props.project.tags.map(function(tag) {
            return (React.createElement("span", {key: tag, className: "label label-default"}, tag));
        });

        var diff = moment(this.props.project.date).fromNow();

        return (
            React.createElement("div", {className: "project-info col-xs-9"}, 
                React.createElement("h2", {className: "project-title"}, 
                    React.createElement("span", {className: "title"}, this.props.project.name), 
                    React.createElement("div", {className: "project-labels"}, 
                        labelNodes
                    )
                ), 
                React.createElement("div", {className: "posted"}, diff), 
                React.createElement("p", {className: "project-description"}, " ", this.props.project.description.split(".")[0] + ".", " "), 
                React.createElement("a", {href: "/project/" + this.props.project._id}, 
                    React.createElement("div", {className: "more"}, " SEE MORE ")
                ), 
                React.createElement(VoteButton, React.__spread({key: this.props.id},  this.props))
            )
        );
    }
});

var ProjectList = React.createClass({displayName: "ProjectList",
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
                    React.createElement("div", {className: "project col-xs-12"}, 
                        React.createElement(ProjectImage, {src: project.images[0]}), 
                        React.createElement(ProjectInfo, {key: project._id, project: project, votes: votes, user: user})
                    )
                );
            }.bind(this))
            .slice(firstEl, firstEl + pageLimit);

        var pageNodes = [];

        for (var i = 0; i < totalLength / pageLimit; i++) {
            var className = i == this.state.currentPage ? "active": "";
            pageNodes.push(
                (React.createElement("li", {key: i, className: className, onClick: this.handleClick.bind(this, i)}, 
                    React.createElement("a", {href: "#!"}, " ", i + 1, " ")
                ))
            );
        }

        if (projectNodes.length > 0) {
            return (
                React.createElement("div", null, 
                    projectNodes, 
                    React.createElement("nav", null, 
                        React.createElement("ul", {className: "pagination"}, " ", pageNodes, 
                            React.createElement("span", {className: "pagination-showing"}, "Showing ", firstEl + 1, " - ", firstEl + projectNodes.length, " of ", totalLength)
                        )
                    )
                )
            );
        } 
        return (React.createElement("div", null, React.createElement("h1", null, "No projects found")));
    }
});

ReactDOM.render(
    React.createElement(ProjectList, {url: "/api/projects"}),
    document.getElementById('projects-container')
);

