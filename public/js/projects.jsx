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
            return (<span className="label label-default">{tag}</span>);
        });

        var memberNodes = this.props.project.contact.map(function(member) {
            return (<span className="member">{member}</span>);
        });

        var projectUrl = "/project/" + this.props.project._id;
        var votes = this.props.project.votes;

        var projectUrl = "/project/" + this.props.project._id;
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
                <VoteButton id={this.props.project._id} user={this.props.user} votes={this.props.project.votes} />
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
        return {projects: [], user: {}};
    },
    componentDidMount: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({projects: data.projects, user: data.user});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        var user = this.state.user;
        var projectNodes = this.state.projects.map(function(project, index) {
            return (<Project key={project._id} project={project} index={index} user={user} />);
        });
        return (<div>{projectNodes}</div>);
    }
});

React.render(
    <ProjectList url="/projects" />,
    document.getElementById('projects-container')
);


