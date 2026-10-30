type PerpDeployAction =
  | { type: "perpDeploy"; registerAsset2: RegisterAsset2 }
  | { type: "perpDeploy"; setOracle: SetOracle }
  | { type: "perpDeploy"; haltTrading: HaltTrading }
  // Margin, funding, fees, limits, annotations, permissions, and other
  // operator actions are documented in the official current reference.