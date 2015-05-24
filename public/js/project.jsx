////////////////////////////////
//   HELPER REACT CLASSES     //
////////////////////////////////

var Editable = React.createClass({
    render: function() {
        if (this.props.editMode) {
            return this.props.input;
        }
        return (<span>{this.props.value}</span>);
    }
});

var SaveEditable = React.createClass({
    render: function() {
        if (this.props.editMode) {
            return (<button onClick={this.props.submit} className="btn btn-primary save-edit">Save</button>);
        }
        return (<span></span>);
    }
});

var EditSelection = React.createClass({
    render: function() {
        if (!this.props.canEdit) {
            return (<div></div>);
        }
        return (
            <span className="dropdown">
                <span className="dropdown-toggle" type="button" id="dropdown" data-toggle="dropdown" aria-expanded="true">
                    <span className="edit-project caret"></span>
                </span>
                <ul className="dropdown-menu" role="menu" aria-labelledby="dropdown">
                <li onClick={this.props.edit} role="presentation"><a role="menuitem" tabIndex="-1" href="#">Edit</a></li>
                </ul>
            </span>
        );
    }
})

var genericSubmit = function(data) {
    $.ajax({
        url: this.props.url,
        method: "PUT",
        data: data,
    }).done(function() {
        this.setState({ 
            saved: data,
            edit: false,
        });
    }.bind(this)).fail(function(err) {
        this.setState({ edit: false });
        console.log(err);
    }.bind(this));
};

///////////////////////////////////
//////////////////////////////////

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
                <ProjectFeed user={user} votes={votes} project={project} canEdit={canEdit} url={this.props.url} />
                <ProjectSidebar update={this.updateVotes} user={user} votes={votes} project={project} canEdit={canEdit} url={this.props.url} />
            </div>
        );
    }
});

/* Project > ProjectFeed */
var ProjectFeed = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        var project = this.props.project;
        return { 
            edit: false,
            saved: { name: project.name, tags: project.tags, description: project.description },
            inputName: project.name,
            inputTags: project.tags,
            inputDescription: project.description,
        }
    },
    edit: function() {
        this.setState({ edit: true });
    },
    submit: function() {
        genericSubmit.bind(this, {
            name: this.state.inputName,
            description: this.state.inputDescription,
            tags: this.state.inputTags,
        })();
    },
    render: function() {
        var project = this.props.project;
        var user = this.props.user;
        var canEdit = this.props.canEdit;
        var saved = this.state.saved;
        var editMode = this.state.edit;
        var imgSrc = project.images[0] ? "/uploads/" + project.images[0] : "/img/suw-logo.png";
        var editName = (<input valueLink={this.linkState('inputName')} name="name"/>);
        var editDescription = (<textarea valueLink={this.linkState('inputDescription')} name="description"/>);
        return (
            <div id="project-feed" className="col-md-8">
                <div className="row basic-info">
                    <div className="title">
                        <div className="col-md-9">
                            <h1>
                                <Editable editMode={editMode} value={saved.name} input={editName}/>
                                <EditSelection canEdit={this.props.canEdit} edit={this.edit} />
                            </h1>
                            <ProjectTags tags={project.tags}/>
                            <p><Editable editMode={editMode} value={saved.description} input={editDescription}/></p>
                            <SaveEditable editMode={editMode} submit={this.submit}/>
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

            var today = new Date();

            rows.push(['Event', 'Today', this.getTooltip({
                title: "Today", description: "What an awesome day!", date: today,
            }), today, today]);

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
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        var project = this.props.project;
        return { 
            edit: false,
            saved: { 
                website: project.website,
                hiring: project.hiring
            },
            inputWebsite: project.website,
            inputHiring: project.hiring
        };
    },
    edit: function() {
        this.setState({ edit: true });
    },
    submit: function() {
        genericSubmit.bind(this, {
            website: this.state.inputWebsite,
            hiring: this.state.inputHiring,
        })();
    },
    render: function() {
        var project = this.props.project;
        var saved = this.state.saved;
        var editWebsite = (<input name="website" valueLink={this.linkState('inputWebsite')}/>);
        var editHiring = (<input type="checkbox" name="hiring" checkedLink={this.linkState('inputHiring')}/>);
        var editWebsiteNode = (<Editable editMode={this.state.edit} value={saved.website} input={editWebsite}/>);
        var websiteNode = (                        
            <a target="_blank" href={saved.website}>{editWebsiteNode}</a>
        );
        if (this.state.edit) {
            websiteNode = editWebsiteNode;
        }
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    Overview
                    <EditSelection canEdit={this.props.canEdit} edit={this.edit}/>
                </div>
                <div className="panel-body">
                    <p>Website:&nbsp;
                        {websiteNode}
                    </p>
                    <p>Hiring:&nbsp;
                        <Editable editMode={this.state.edit} value={saved.hiring ? "Yes": "No"} input={editHiring}/>
                    </p>
                    <p>Posted On: { (new Date(project.date)).toLocaleDateString() }</p>
                    <SaveEditable editMode={this.state.edit} submit={this.submit}/>
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

