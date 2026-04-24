{{/*
Expand the name of the chart.
*/}}
{{- define "dynamoprototype.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a fully qualified app name. Truncated to 63 chars (k8s name limit).
*/}}
{{- define "dynamoprototype.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Component fullnames.
*/}}
{{- define "dynamoprototype.frontend.fullname" -}}
{{- printf "%s-frontend" (include "dynamoprototype.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "dynamoprototype.agentApi.fullname" -}}
{{- printf "%s-agent-api" (include "dynamoprototype.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Chart label.
*/}}
{{- define "dynamoprototype.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels applied to every object.
*/}}
{{- define "dynamoprototype.labels" -}}
helm.sh/chart: {{ include "dynamoprototype.chart" . }}
app.kubernetes.io/name: {{ include "dynamoprototype.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{/*
Per-component selector labels.
*/}}
{{- define "dynamoprototype.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "dynamoprototype.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: frontend
{{- end -}}

{{- define "dynamoprototype.agentApi.selectorLabels" -}}
app.kubernetes.io/name: {{ include "dynamoprototype.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: agent-api
{{- end -}}

{{/*
Resolve a per-component image reference.
Usage: {{ include "dynamoprototype.image" (dict "root" . "component" .Values.frontend) }}
*/}}
{{- define "dynamoprototype.image" -}}
{{- $root := .root -}}
{{- $component := .component -}}
{{- $registry := $root.Values.image.registry -}}
{{- $repo := $component.image.repository -}}
{{- $tag := default $root.Values.image.tag $component.image.tag -}}
{{- if not $tag -}}
{{- fail "image.tag (or component.image.tag) must be set" -}}
{{- end -}}
{{- if $registry -}}
{{- printf "%s/%s:%s" $registry $repo $tag -}}
{{- else -}}
{{- printf "%s:%s" $repo $tag -}}
{{- end -}}
{{- end -}}

{{/*
Name of the Secret holding runtime credentials. Either user-supplied
(useExisting) or the chart-managed one we render.
*/}}
{{- define "dynamoprototype.secretName" -}}
{{- if .Values.secrets.useExisting -}}
{{- required "secrets.existingSecretName is required when secrets.useExisting=true" .Values.secrets.existingSecretName -}}
{{- else -}}
{{- printf "%s-secrets" (include "dynamoprototype.fullname" .) -}}
{{- end -}}
{{- end -}}

{{/*
Name of the ConfigMap holding non-secret runtime config.
*/}}
{{- define "dynamoprototype.configMapName" -}}
{{- printf "%s-config" (include "dynamoprototype.fullname" .) -}}
{{- end -}}
