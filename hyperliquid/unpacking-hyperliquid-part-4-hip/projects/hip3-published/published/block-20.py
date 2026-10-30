oracle_pxs = {
    "demo:ASSET": "100.12",
}

mark_pxs = [{
    "demo:ASSET": "100.10",
}]

external_perp_pxs = {
    "demo:ASSET": "100.11",
}

result = exchange.perp_deploy_set_oracle(
    "demo",
    oracle_pxs,
    mark_pxs,
    external_perp_pxs,
)