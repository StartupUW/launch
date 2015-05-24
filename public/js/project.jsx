/* Project */
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
        var project = this.state.project;
        if (!project) return (<h1>Project Not Found</h1>);
        var user = this.state.user;
        var votes = this.state.votes;
        var canEdit = user && project.members.filter(function(member) {
            return member.user._id == user._id;
        }).length == 1;
        return (
            <div className="row">
                <ProjectFeed user={user} votes={votes} project={project} canEdit={canEdit} />
                <ProjectSidebar update={this.updateVotes} url={this.props.url} user={user} votes={votes} project={project} canEdit={canEdit} />
            </div>
        );
    }
});

/* Project > ProjectFeed */
var ProjectFeed = React.createClass({
    render: function() {
        var project = this.props.project;
        var user = this.props.user;
        var canEdit = this.props.canEdit;
        var imgSrc = project.images[0] ? "/uploads/" + project.images[0] : "/img/suw-logo.png";
        return (
            <div id="project-feed" className="col-md-8">
                <div className="row basic-info">
                    <div className="title">
                        <div className="col-md-9">
                            <h1>{project.name}</h1>
                            <ProjectTags tags={project.tags} canEdit={this.props.canEdit}/>
                            <p>{project.description}</p>
                        </div>
                        <div className="hidden-xs hidden-sm col-md-3">
                            <div className="img-responsive"><img className="logo" src={imgSrc}/></div>
                        </div>
                    </div>
                </div>
                <ProjectDemo user={user} project={project} canEdit={canEdit}/>
                <GoogleTimeline graphName="timeline" timeline={project.timeline} canEdit={canEdit}/>
                <ProjectMembers members={project.members} canEdit={canEdit}/>
            </div>
        );
    }
});

/* Project > ProjectFeed > ProjectTags*/
var ProjectTags = React.createClass({
    render: function() {
        var tagNodes = this.props.tags.map(function(tag) {
            return(<span key={tag} className="label label-primary">{tag}</span>);
        });
        return (<div className="tags">{ tagNodes }</div>);
    }
});

/* Project > ProjectFeed > ProjectDemo */
var ProjectDemo = React.createClass({
    render: function() {
        var user = this.props.user;
        var demo = this.props.project.demo;
        var demoNode = (<p>No demo added yet!</p>);
        if (!demo && !this.props.canEdit) {
            return (<div></div>);
        } else if (demo){
            demoNode = (<iframe src={demo} width="100%" height="400px" />);
        } 
        return (
            <div className="project-demo">
                <h2>Project Demo</h2>
                {demoNode}
            </div>
        );
    }
});

var GoogleTimeline = React.createClass({
    componentDidMount: function() {
        this.drawCharts();
    },
    componentDidUpdate: function() {
        this.drawCharts();
    },
    getTooltip: function(event, date) {
        return React.renderToString((
            <div className="timeline-tooltip">
                <h1>{event.title}</h1>
                <p>{event.description}</p>
                <p>{event.date.toDateString()}</p>
            </div>
        ));
    },
    drawCharts: function() {
        if (this.props.timeline.length) {
            var dataTable = new google.visualization.DataTable();

            dataTable.addColumn({ type: 'string', id: 'Type' });
            dataTable.addColumn({ type: 'string', id: 'Title' });
            dataTable.addColumn({ type: 'string', role: 'tooltip', 'p': {html: true}});
            dataTable.addColumn({ type: 'date', id: 'Start' });
            dataTable.addColumn({ type: 'date', id: 'End' });

            var rows = this.props.timeline.map(function(event) {
                event.date = new Date(event.date);
                return ['Event', event.title, this.getTooltip(event), event.date, event.date];
            }.bind(this));

            rows.push(['Event', 'Today', 'Today', new Date(), new Date()]);

            dataTable.addRows(rows);

            var options = {
                timeline: { groupByRowLabel: true },
                tooltip: { isHtml: true },
            };

            var chart = new google.visualization.Timeline(
              document.getElementById(this.props.graphName)
            );

            chart.draw(dataTable, options);
        }
    },    
    render: function() {
        var timelineNode = (<p>No timeline events added yet!</p>);
        if (!this.props.timeline.length && !this.props.canEdit) {
            return (<div></div>);
        } else if (this.props.timeline.length) {
            timelineNode = (<div id={this.props.graphName} style={{height: 100, width: "100%"}}></div>);
        }
        return (
            <div>
                <h2>Event Timeline</h2>
                {timelineNode}
            </div>
        );
    }
});

/* Project > ProjectFeed > ProjectMembers */
var ProjectMembers = React.createClass({
    render: function() {
        var memberNodes = this.props.members.map(function(member) {
            return (<ProjectMember key={member._id} member={member.user} />)
        });
        return (
            <div>
                <h2>Founders</h2>
                <div className="members row">
                    { memberNodes }
                </div>
            </div>
        );
    }
});


/* Project > ProjectFeed > ProjectMembers > ProjectMember  */
var ProjectMember = React.createClass({
    render: function() {
        var member = this.props.member;
        return (
            <div className="member col-xs-12 media">
                <div className="media-left"><img className="media-object" src={member.picture} height="70px" width="70px"></img></div>
                <div className="media-body">
                    <a href={"/profile/" + member._id}>
                        <h4 className="media-heading">
                            {member.fname} {member.lname}
                            <span className="grad">{member.major} {member.gradyr}</span>
                        </h4>
                    </a>
                    <p className="email">{member.email}</p>
                    <p className="bio">{member.bio}</p>
                </div>
            </div>
        );
    }
});

/* Project > ProjectSidebar */
var ProjectSidebar = React.createClass({
    render: function() {
        var project = this.props.project;
        return (
            <div id="project-sidebar" className="col-md-4">
                <ProjectOverview project={project} {...this.props} />
                <ProjectVotes votes={this.props.votes}/>
                <SocialMedia />
                <FacebookPage page={project.fbPage} />
            </div>
        );
    }
});

/* Project > ProjectSidebar > ProjectOverview */
var ProjectOverview = React.createClass({
    render: function() {
        var project = this.props.project;
        return (
            <div className="panel panel-default">
                <div className="panel-heading">Overview</div>
                <div className="panel-body">
                    <p>Website: <a target="_blank" href={project.website}>{project.website}</a></p>
                    <p>Hiring: {project.hiring ? "Yes": "No"}</p>
                    <p>Posted On: { (new Date(project.date)).toLocaleDateString() }</p>
                    <VoteButton {...this.props} />
                </div>
            </div>
        );
    }
});


/* Project > ProjectSidebar > ProjectOverview > VoteButton */
var VoteButton = React.createClass({
    getInitialState: function() {
        var user = this.props.user;
        var voted = user && this.props.votes.filter(function(el) {
            return el.user._id === user._id;
        }).length === 1;
        return { voted: voted };
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
        if (!user) return (<div></div>);
        return (
            <div onClick={this.handleClick} className={className}>
                <span className="glyphicon glyphicon-heart"></span>
                <span className="vote-count">Upvote</span>
            </div>
        );
    }
});


/* Project > ProjectFeed > ProjectVotes */
var ProjectVotes = React.createClass({
    updateTooltips: function() {
        for (index in this.props.votes) {
            var user = this.props.votes[index].user;
            $("img." + user._id).tooltip({
                title: user.fname,
                placement: 'bottom',
            });
        }
    },
    componentDidMount: function() {
        this.updateTooltips();
    },
    componentDidUpdate: function() {
        this.updateTooltips();
    },
    render: function() {
        var votes = this.props.votes;
        var voteNodes = (<h2>Be the first to upvote this!</h2>);
        if (votes.length) {
            voteNodes = votes.map(function(vote) {
                return (
                    <a key={vote._id} href={"/profile/" + vote.user._id}>
                        <div className="col-xs-3 col-sm-3 voter">
                            <img className={"img-circle " + vote.user._id} src={vote.user.picture}></img>
                        </div>            
                    </a>
                );
            });
        }
        return (
            <div className="panel panel-default">
                <div className="panel-heading">Upvotes &bull; { votes.length }</div>
                <div className="panel-body">
                    {voteNodes}
                </div>
            </div>
        );
    }
});

/* Project > ProjectSidebar > ProjectOverview > SocialShares*/
var SocialMedia = React.createClass({
    render: function() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">Social Media</div>
                <div className="panel-body" id="fb-social-shares">
                    <div className="fb-send" data-href={window.location.href}></div>
                    <div className="fb-like" data-href={window.location.href} data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div>
                </div>
            </div>
        )
    }
})

/* Project > ProjectSidebar > ProjectOverview > FacebookPage */
var FacebookPage = React.createClass({
    render: function() {
        var page = this.props.page;
        if (page) {
            return (
                <div className="fb-page" data-href={page} data-width="350" data-hide-cover="true" data-show-facepile="true" data-show-posts="false">
                    <div className="fb-xfbml-parse-ignore">
                        <blockquote cite={page}><a href={page}></a></blockquote>
                    </div>
                </div>
            );
        }
        return (<div></div>);
    }
});

google.load('visualization', '1.1', {
    packages: ['timeline'],
    callback: function() {
        React.render(
            <Project url={"/api/project/" + $("#project-id").val()}/>,
            document.getElementById('project-container')
        );
    }
});

