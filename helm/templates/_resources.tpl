{{/*
Create configmap name as used by the service name label.
*/}}
{{- define "configmap.fullname" -}}
{{- printf "%s-%s-%s" .Release.Name .Chart.Name "configmap" | indent 1 }}
{{- end }}

{{- define "deployment.fullname" -}}
{{- printf "%s-%s-%s" .Release.Name .Chart.Name "deployment" | indent 1 }}
{{- end }}
