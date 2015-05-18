var Member = React.createClass({
    render: function() {
        var user = this.props.member.user;
        return (
            <div className="member col-xs-12 media">
                <div className="media-left">
                    <img className="media-object" src={user.picture} height="70px" width="70px"></img>
                </div>
                <div className="media-body">
                    <a href={"/profile/" + user._id}>
                        <h4 className="media-heading">
                            {user.fname} {user.lname}
                            <span className="grad">{user.major} {user.gradyr}</span>
                        </h4>
                    </a>
                    <p className="email">{user.email}</p>
                    <p className="bio">{user.bio}</p>
                </div>
            </div>
        );
    }
});

var ProjectInfo = React.createClass({
    render: function() {
        var project = this.props.project;

        var memberNodes = project.members.map(function(member) {
            return (<Member member={member} />);
        });

        var voteNodes = this.props.votes.map(function(vote) {
            return (
                <div className="col-xs-3 col-sm-2 voter">
                    <img className="img-circle" src={vote.user.picture}></img>
                    <span>{vote.user.fname}</span>
                </div>            
            );
        });

        var tagNodes = project.tags.map(function(tag, index) {
            return(<span className="label label-primary">{tag}</span>);
        });

        var imgSrc = project.images[0] ? "/uploads/" + project.images[0] : "/img/suw-logo.png";

        return (
            <div id="project-info" className="col-md-8">
                <div className="row basic-info">
                    <div className="title">
                        <div className="col-md-9">
                            <h1>{project.name}</h1>
                            <div className="tags">{ tagNodes }</div>
                            <p>{project.description}</p>
                        </div>
                        <div className="hidden-xs hidden-sm col-md-3">
                            <div className="img-responsive">
                                <img className="logo" src={imgSrc}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 members row">
                        <h2>Founders</h2>
                        { memberNodes }
                    </div>

                </div>
                <div className="panel panel-default">
                    <div className="panel-heading">Upvotes</div>
                    <div className="panel-body">
                        {voteNodes}
                    </div>
                </div>
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
            voted: voted
        };
    },
    handleClick: function() {
        if (this.props.user) {
            $.get(this.props.url + '/vote', function(data) {
                this.setState({
                    voted: data.voteStatus
                });
                this.props.update(data.votes);
            }.bind(this), 'json')
        }
    },
    render: function() {
        var user = this.props.user;
        var className = "vote-large" + (this.state.voted ? " user-voted" : " user-not-voted");

        return (
            <div onClick={this.handleClick} className={className}>
                <span className="glyphicon glyphicon-heart"></span>
                <span className="vote-count">Upvote</span>
            </div>
        );
    }
});


var ProjectFeed = React.createClass({
    render: function() {
        var project = this.props.project;
        var fbNode = '';
        if (project.fbPage) {
            fbNode = (
                <div className="fb-page" data-href={project.fbPage} data-width="350" data-hide-cover="true" data-show-facepile="true" data-show-posts="false">
                    <div className="fb-xfbml-parse-ignore">
                        <blockquote cite={project.fbPage}><a href={project.fbPage}></a></blockquote>
                    </div>
                </div>
            );
        }
        var voteNode = this.props.user ? (<VoteButton {...this.props} />) : (<div></div>);
        return (
            <div id="project-feed" className="col-md-4">
                <div className="panel panel-default">
                    <div className="panel-heading">Overview</div>
                    <div className="panel-body">
                        <p>Website: <a target="_blank" href={project.website}>{project.website}</a></p>
                        <p>Hiring: {project.hiring ? "Yes": "No"}</p>
                        <p>Posted On: { (new Date(project.date)).toLocaleDateString()}</p>
                        { voteNode }
                    </div>
                </div>
                <div className="panel panel-default">
                    <div className="panel-heading">Social Shares</div>
                    <div className="panel-body" id="fb-social-shares">
                        <div className="fb-send" data-href={window.location.href}></div>
                        <div className="fb-like" data-href={window.location.href} data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div>
                    </div>
                </div>
                { fbNode }
            </div>
        );
    }
});


var Project = React.createClass({
    getInitialState: function() {
        return { project: null, members: null, votes: null, user: null }
    },
    updateVotes: function(votes) {
        this.setState({ votes: votes });
    },
    componentDidMount: function() {
        $.get(this.props.url, function(data) {
            this.setState({
                project: data.project,
                votes: data.votes,
                user: data.user,
            });
            loadFacebook();
        }.bind(this), 'json')
        .fail(function(xhr, status, err) {
            console.log(err);
        });
    },
    render: function() {
        if(!this.state.project) {
            return (<h1> Project Not Found </h1>);
        }
        return (
            <div className="row">
                <ProjectInfo user={this.state.user} votes={this.state.votes} project={this.state.project} />
                <ProjectFeed update={this.updateVotes.bind(this)} url={this.props.url} user={this.state.user} votes={this.state.votes} project={this.state.project} fbPage={this.state.project.fbPage} />
            </div>
        );
    }
});

React.render(
    <Project url={"/api/project/" + $("#project-id").val()}/>,
    document.getElementById('project-container')
);

