package model

import "github.com/alvi/alvob/timeseries"

type TrafficKind string

const (
	TrafficKindInternetEgress TrafficKind = "internet_egress"
	TrafficKindCrossAZEgress  TrafficKind = "cross_az_egress"
	TrafficKindCrossAZIngress TrafficKind = "cross_az_ingress"
)

type TrafficStats struct {
	InternetEgress *timeseries.TimeSeries
	CrossAZEgress  *timeseries.TimeSeries
	CrossAZIngress *timeseries.TimeSeries
}
