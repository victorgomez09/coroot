package views

import (
	"context"
	"net/url"

	"github.com/alvi/alvob/api/views/application"
	"github.com/alvi/alvob/api/views/applications"
	"github.com/alvi/alvob/api/views/aws"
	"github.com/alvi/alvob/api/views/incident"
	"github.com/alvi/alvob/api/views/inspections"
	"github.com/alvi/alvob/api/views/logs"
	"github.com/alvi/alvob/api/views/overview"
	"github.com/alvi/alvob/api/views/profiling"
	"github.com/alvi/alvob/api/views/roles"
	"github.com/alvi/alvob/api/views/tracing"
	"github.com/alvi/alvob/api/views/users"
	"github.com/alvi/alvob/clickhouse"
	"github.com/alvi/alvob/db"
	"github.com/alvi/alvob/model"
	"github.com/alvi/alvob/rbac"
	"github.com/alvi/alvob/timeseries"
)

func Overview(ctx context.Context, ch *clickhouse.Client, w *model.World, view, query string) *overview.Overview {
	return overview.Render(ctx, ch, w, view, query)
}

func Application(w *model.World, app *model.Application) *application.View {
	return application.Render(w, app)
}

func Incident(w *model.World, app *model.Application, i *model.ApplicationIncident) *incident.View {
	return incident.Render(w, app, i)
}

func Profiling(ctx context.Context, ch *clickhouse.Client, app *model.Application, q url.Values, wCtx timeseries.Context) *profiling.View {
	return profiling.Render(ctx, ch, app, q, wCtx)
}

func Tracing(ctx context.Context, ch *clickhouse.Client, app *model.Application, q url.Values, w *model.World) *tracing.View {
	return tracing.Render(ctx, ch, app, q, w)
}

func Logs(ctx context.Context, ch *clickhouse.Client, app *model.Application, q url.Values, w *model.World) *logs.View {
	return logs.Render(ctx, ch, app, q, w)
}

func Inspections(checkConfigs model.CheckConfigs) *inspections.View {
	return inspections.Render(checkConfigs)
}

func CustomApplications(p *db.Project) *applications.CustomApplicationsView {
	return applications.RenderCustomApplications(p)
}

func AWS(w *model.World) *aws.View {
	return aws.Render(w)
}

func Roles(rs []rbac.Role) *roles.View {
	return roles.Render(rs)
}

func Users(us []*db.User, rs []rbac.Role) *users.Users {
	return users.RenderUsers(us, rs)
}

func User(u *db.User, projects map[db.ProjectId]string, viewonly bool) *users.User {
	return users.RenderUser(u, projects, viewonly)
}
